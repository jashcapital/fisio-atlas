import * as THREE from "three";
import { arbolDe, arbolesListos, hayBVH } from "./bvh.js";

// Ghost mode: instead of making non-selected meshes translucent (which causes
// Z-order flicker during rotation), we desaturate them toward dark grey. The
// outline pass handles the cyan highlight on the selected structure.
const FADE_FACTOR = 0.28; // multiplier on base color; lower = darker background

// Biomecánica: al enfocar un músculo, sus huesos de ORIGEN se tiñen de azul
// y los de INSERCIÓN de rojo, para ver de dónde a dónde tira el músculo.
const ORIGIN_COLOR = new THREE.Color(0x4f9fff);
// Naranja coral, no rojo: el rojo de inserción se confundía con el carmesí del
// propio músculo seleccionado (tríada azul / carmesí / coral, sin ambigüedad).
const INSERTION_COLOR = new THREE.Color(0xff8c42);
// Nervios en rayos X: atenuación de color (opacos, ver applyFocus).
const NERVE_FADE = 0.45;

// El visor dibuja bajo demanda (scene.js): quien cambia colores o transparencias
// tiene que avisar. Hasta ahora estos cambios se veían "de rebote", porque casi
// siempre llegaban junto a un cambio de contorno o a un evento del ratón; al
// revelar la respuesta en el examen de reconocer, por ejemplo, no llegaba
// ninguno y el tintado de inserciones esperaba al latido de 1 s.
const pedirRender = () => window.dispatchEvent(new Event("fisio:render"));

export function applyFocus(model, fichaId, opts = {}) {
  const origin = new Set(opts.origen_huesos || []);
  const insertion = new Set(opts.insercion_huesos || []);
  // Vista de inserciones: cuando el músculo enfocado tiene huesos de
  // origen/inserción, "fantasmeamos" el resto de músculos (semitransparentes)
  // para revelar el esqueleto con sus inserciones teñidas.
  const attachmentView = origin.size + insertion.size > 0;
  // Rayos X SIEMPRE que se selecciona algo desde la interfaz (músculo, hueso,
  // nervio o ligamento): antes solo se activaba con huesos mapeados, y un
  // hueso, un nervio o un músculo profundo quedaban enterrados entre músculos
  // opacos oscurecidos — "señalo un músculo y no se ve". Se infiere de que la
  // llamada traiga las claves de inserciones (la selección normal las pasa
  // aunque vengan vacías); el modo examen llama con `{}` a propósito para no
  // regalar la respuesta y conserva la vista opaca. `opts.xray` lo fuerza.
  const xray = opts.xray ?? ("origen_huesos" in opts || "insercion_huesos" in opts);
  let highlighted = 0;

  const opaque = (mesh) => {
    mesh.material.transparent = false;
    mesh.material.opacity = 1.0;
    mesh.material.depthWrite = true;
    mesh.material.side = THREE.DoubleSide; // como los crea loader.js
  };
  // Fantasmas solo con cara frontal: en DoubleSide se dibujaban cara y
  // contracara al 10 %, el doble de neblina roja sobre lo seleccionado.
  // Cambiar `side` no recompila el shader (solo el culling), así que es gratis.
  const ghost = (mesh) => {
    mesh.material.transparent = true;
    mesh.material.opacity = 0.07;
    mesh.material.depthWrite = false;
    mesh.material.side = THREE.FrontSide;
  };

  for (const mesh of model.pickables) {
    const base = mesh.userData.baseColor;
    if (!base) continue;
    const fid = mesh.userData.fichaId;
    // picker.js usa esta marca: los fantasmas solo dejan pasar el clic hacia
    // estructuras enfocadas.
    mesh.userData.enfoque = fid === fichaId || origin.has(fid) || insertion.has(fid);
    if (fid === fichaId) {
      mesh.material.color.copy(base);
      opaque(mesh);
    } else if (origin.has(fid)) {
      mesh.material.color.copy(ORIGIN_COLOR);
      opaque(mesh);
      highlighted++;
    } else if (insertion.has(fid)) {
      mesh.material.color.copy(INSERTION_COLOR);
      opaque(mesh);
      highlighted++;
    } else if ((attachmentView || xray) && mesh.userData.tipo === "muscle") {
      // Otros músculos: fantasma, para no tapar lo seleccionado ni los huesos resaltados.
      mesh.material.color.setRGB(base.r * FADE_FACTOR, base.g * FADE_FACTOR, base.b * FADE_FACTOR);
      ghost(mesh);
    } else if ((attachmentView || xray) && mesh.userData.tipo === "nerve") {
      // Nervios: atenuados pero OPACOS. Probado con transparencia sin
      // depthWrite: se dibujaban por encima de huesos y cuerpo ("espagueti"
      // crema), peor que antes. Opacos quedan bien ocluidos y siguen siendo
      // clicables; el 0,45 los deja algo más vivos que los huesos (0,28) para
      // que se reconozcan como nervios sin gritar.
      mesh.material.color.setRGB(base.r * NERVE_FADE, base.g * NERVE_FADE, base.b * NERVE_FADE);
      opaque(mesh);
    } else {
      mesh.material.color.setRGB(base.r * FADE_FACTOR, base.g * FADE_FACTOR, base.b * FADE_FACTOR);
      opaque(mesh);
    }
  }
  pedirRender();
  return { origin: origin.size, insertion: insertion.size, highlighted };
}

export function clearFocus(model) {
  for (const mesh of model.pickables) {
    const base = mesh.userData.baseColor;
    if (base) mesh.material.color.copy(base);
    mesh.userData.enfoque = false;
    mesh.material.transparent = false;
    mesh.material.opacity = 1.0;
    mesh.material.depthWrite = true;
    mesh.material.side = THREE.DoubleSide;
  }
  pedirRender();
}

let activeTween = null;

// Un solo vuelo de cámara a la vez. Había dos animaciones independientes —esta
// y `flyTo` de scene.js (vistas y "volver al inicio")— y si una empezaba con
// la otra en marcha, las dos escribían la cámara en cada frame hasta que
// acababa la última: pulsar Esc y elegir enseguida otra estructura, o una
// vista durante un encuadre, terminaba en la posición de la que acabara más
// tarde, no en la pedida. Ahora quien empieza un vuelo lo anuncia y los demás
// se cancelan; scene.js lo anuncia también cuando el usuario coge la cámara,
// para que el vuelo no le pelee el arrastre o la rueda.
const QUIEN = "focus";
window.addEventListener("fisio:camara-vuelo", (e) => {
  if (e.detail !== QUIEN && activeTween) {
    cancelAnimationFrame(activeTween);
    activeTween = null;
  }
});

// Última malla clicada (la publica picker.js). Sirve para elegir el LADO que
// el usuario señaló: sin esto se encuadraba el lado más cercano al target,
// que a menudo era el contrario al clicado.
let ultimoClic = null;
window.addEventListener("fisio:pick", (e) => {
  ultimoClic = e.detail?.mesh ?? null;
});

const CONTRALATERAL_FADE = 0.55;

/** Mallas de una ficha: del índice del loader si existe (O(1)), si no filtrando. */
function mallasDe(model, id) {
  return model.porFicha?.get(id) ?? model.pickables.filter((m) => m.userData.fichaId === id);
}

/**
 * ¿Hace falta mover la cámara para ver bien esta estructura?
 *
 * Reencuadrar siempre que se selecciona algo desorienta: si ya te habías
 * colocado donde querías, la cámara te la quita de debajo. Solo se interviene
 * cuando la estructura se sale del encuadre o queda tan pequeña que no se
 * distingue.
 */
function necesitaReencuadre(box, camera) {
  const puntos = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];
  camera.updateMatrixWorld();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let algunoDelante = false;
  for (const p of puntos) {
    const ndc = p.clone().project(camera);
    // z fuera de [-1,1] significa detrás de la cámara o más allá del far plane
    if (ndc.z > -1 && ndc.z < 1) algunoDelante = true;
    minX = Math.min(minX, ndc.x); maxX = Math.max(maxX, ndc.x);
    minY = Math.min(minY, ndc.y); maxY = Math.max(maxY, ndc.y);
  }
  if (!algunoDelante) return true;              // está detrás: hay que ir
  if (maxX < -1 || minX > 1 || maxY < -1 || minY > 1) return true; // fuera de plano
  const alto = (maxY - minY) / 2;               // fracción de la media altura
  const ancho = (maxX - minX) / 2;
  if (Math.max(alto, ancho) < 0.09) return true; // demasiado pequeña para verla
  if (Math.max(alto, ancho) > 2.6) return true;  // tan cerca que no se ve entera
  return false;
}

/**
 * De una estructura bilateral, quédate con UN lado.
 *
 * Casi todo el catálogo existe por duplicado (derecha e izquierda). Al unir
 * las cajas de los dos lados, la caja resultante abarca el ancho del cuerpo:
 * medido, el PISIFORME —un hueso del carpo de un centímetro— daba un tamaño de
 * 1,013 y el fémur 0,826. Con esa caja, encuadrar el pisiforme alejaba la
 * cámara como para ver el torso entero, y el zoom parecía no responder.
 *
 * Se separa por el signo de X (el modelo está centrado, así que x=0 es la línea
 * media) y se elige el lado más próximo a lo que ya se estaba mirando, para no
 * saltar de un lado al otro sin motivo. Las estructuras impares —esternón,
 * sacro, línea alba— no se parten: sus mallas caen todas del mismo lado o
 * cruzan la línea media, y entonces se devuelven enteras.
 */
function ladoMasCercano(meshes, target) {
  if (meshes.length < 2) return meshes;

  const centro = new THREE.Vector3();
  const der = [];
  const izq = [];
  for (const m of meshes) {
    m.updateMatrixWorld();
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) continue;
    m.geometry.boundingBox.getCenter(centro);
    m.localToWorld(centro);
    (centro.x >= 0 ? der : izq).push({ m, x: centro.x });
  }
  if (!der.length || !izq.length) return meshes;

  // Si los dos grupos se tocan, no son dos lados: es una estructura que cruza
  // la línea media y hay que encuadrarla entera.
  const minDer = Math.min(...der.map((o) => o.x));
  const maxIzq = Math.max(...izq.map((o) => o.x));
  if (minDer - maxIzq < 0.02) return meshes;

  // Si se clicó una malla de esta estructura, manda ese lado.
  if (ultimoClic && meshes.includes(ultimoClic)) {
    const enDer = der.some((o) => o.m === ultimoClic);
    return (enDer ? der : izq).map((o) => o.m);
  }

  const mediaDer = der.reduce((a, o) => a + o.x, 0) / der.length;
  const mediaIzq = izq.reduce((a, o) => a + o.x, 0) / izq.length;
  const elegido =
    Math.abs(mediaDer - target.x) <= Math.abs(mediaIzq - target.x) ? der : izq;
  return elegido.map((o) => o.m);
}

const _origen = new THREE.Vector3();
const _hacia = new THREE.Vector3();
const _rayo = new THREE.Ray();
const _rayoLocal = new THREE.Ray();
const _inv = new THREE.Matrix4();
const _va = new THREE.Vector3();
const _vb = new THREE.Vector3();
const _vc = new THREE.Vector3();
const _corte = new THREE.Vector3();
const _oc = new THREE.Vector3();

/**
 * Puntos reales de la superficie de la estructura (hasta 3 vértices por malla).
 * Se lanzan rayos hacia ellos y no hacia el centro de la caja: en un hueso
 * plano como la escápula el centro de la caja cae en el aire y el rayo no
 * tocaría la estructura ni estando a la vista.
 */
function puntosMuestra(meshes) {
  const puntos = [];
  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    if (!pos) continue;
    m.updateMatrixWorld();
    const n = pos.count;
    for (const f of [0.15, 0.5, 0.85]) {
      const i = Math.min(n - 1, Math.floor(n * f));
      puntos.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
    }
  }
  return puntos;
}

/*
 * Prueba de oclusión: "¿se ve al menos la mitad de la estructura desde aquí?".
 *
 * Era la parte más cara de seleccionar, con mucho. Se hacía con
 * `Raycaster.intersectObjects(ocluyentes)` por cada punto muestra y cada
 * dirección candidata, y eso calcula TODOS los cortes del rayo con TODAS las
 * mallas que toca —con uv, normal y ordenación— para acabar preguntando solo
 * si había alguno. Medido (SwiftShader, `selectById` síncrono, sin render):
 * mediana 149 ms por selección, y en las estructuras enterradas, que ninguna
 * dirección deja ver y obligan a probar las 12: esfenoides 26 s, trigémino
 * 24 s, occipital 17 s, palatino 15 s — la interfaz congelada todo ese tiempo.
 *
 * Ahora cada rayo es un SEGMENTO que para en el primer corte: se descartan por
 * esfera las mallas que no tocan el tramo cámara→punto, las que quedan se
 * prueban de la más cercana a la más lejana y, dentro de cada una, triángulo a
 * triángulo hasta el primer corte. Y cada dirección deja de probar puntos en
 * cuanto el resultado (≥ 50 % visibles) está decidido. El veredicto es el
 * mismo que antes; solo se deja de calcular lo que no se usaba.
 */

/** Esferas envolventes en mundo de los ocluyentes, una vez por encuadre. */
function prepararOcluyentes(meshes) {
  const out = [];
  for (const m of meshes) {
    const g = m.geometry;
    if (!g.attributes.position) continue;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const s = g.boundingSphere.clone().applyMatrix4(m.matrixWorld);
    out.push({ m, c: s.center, r2: s.radius * s.radius });
  }
  return out;
}

const _rc = new THREE.Raycaster();
_rc.firstHitOnly = true;
const _cortes = [];

/** ¿Corta el rayo `_rayo` a la malla antes de la distancia `d` (en mundo)? */
function cortaAntesDe(m, d) {
  // Con BVH (bvh.js): el corte más cercano bajando por el árbol, en
  // microsegundos. Es lo que ha quitado el tope de tiempo de abajo.
  const arbol = arbolDe(m.geometry);
  if (arbol) {
    _rc.ray.copy(_rayo);
    _rc.near = 0;
    _rc.far = d;
    _cortes.length = 0;
    arbol.raycastObject3D(m, _rc, _cortes);
    return _cortes.length > 0 && _cortes[0].distance < d;
  }
  // Sin la librería: triángulo a triángulo hasta el primer corte.
  const g = m.geometry;
  const pos = g.attributes.position;
  _inv.copy(m.matrixWorld).invert();
  _rayoLocal.copy(_rayo).applyMatrix4(_inv);
  if (g.boundingBox && !_rayoLocal.intersectsBox(g.boundingBox)) return false;
  const idx = g.index;
  const total = idx ? idx.count : pos.count;
  const ini = Math.max(0, g.drawRange.start);
  const fin = Math.min(total, g.drawRange.start + g.drawRange.count);
  for (let i = ini; i + 2 < fin; i += 3) {
    _va.fromBufferAttribute(pos, idx ? idx.getX(i) : i);
    _vb.fromBufferAttribute(pos, idx ? idx.getX(i + 1) : i + 1);
    _vc.fromBufferAttribute(pos, idx ? idx.getX(i + 2) : i + 2);
    // Caras según `side`, como Mesh.raycast (los ocluyentes son opacos y en la
    // práctica DoubleSide: sin descarte).
    const side = m.material.side;
    const corta = side === THREE.BackSide
      ? _rayoLocal.intersectTriangle(_vc, _vb, _va, true, _corte)
      : _rayoLocal.intersectTriangle(_va, _vb, _vc, side === THREE.FrontSide, _corte);
    if (!corta) continue;
    // La distancia se mide en mundo: el modelo está escalado y la del espacio
    // local no vale (así lo hace también three en Mesh.raycast).
    if (_corte.applyMatrix4(m.matrixWorld).distanceTo(_rayo.origin) < d) return true;
  }
  return false;
}

/** ¿Hay algo opaco entre el origen de `_rayo` y la distancia `d`? */
function segmentoTapado(d, ocl) {
  const cand = [];
  const o = _rayo.origin;
  const dir = _rayo.direction;
  for (const x of ocl) {
    _oc.subVectors(x.c, o);
    const tca = _oc.dot(dir);
    const d2 = _oc.lengthSq() - tca * tca;
    if (d2 > x.r2) continue;
    const thc = Math.sqrt(x.r2 - d2);
    if (tca + thc < 0 || tca - thc > d) continue; // la esfera no toca el tramo
    cand.push({ m: x.m, t: tca - thc });
  }
  cand.sort((a, b) => a.t - b.t);
  for (const c of cand) if (cortaAntesDe(c.m, d)) return true;
  return false;
}

/** ¿Se ve sin nada opaco delante al menos la mitad de los puntos muestra desde `dir`? */
function seVeDesde(dir, center, distance, muestras, ocl, limite = Infinity) {
  if (!muestras.length || !ocl.length) return true;
  _origen.copy(center).addScaledVector(dir, distance);
  const necesarios = Math.ceil(muestras.length * 0.5);
  let visibles = 0;
  let tapados = 0;
  for (const p of muestras) {
    _hacia.copy(p).sub(_origen);
    const d = _hacia.length();
    _rayo.set(_origen, _hacia.normalize());
    // solo cuenta lo que hay ANTES del punto
    if (segmentoTapado(d - 1e-3, ocl)) tapados++;
    else visibles++;
    if (visibles >= necesarios) return true;
    if (muestras.length - tapados < necesarios) return false;
    if (performance.now() > limite) return false; // tope agotado: sin veredicto, no se usa
  }
  return visibles >= necesarios;
}

/** Direcciones candidatas: la actual, "hacia fuera" del cuerpo, y el resto por menor giro. */
function candidatasDireccion(center, dirActual) {
  const lateral = new THREE.Vector3(center.x, 0, center.z);
  const haciaFuera = lateral.lengthSq() > 1e-4 ? lateral.normalize() : new THREE.Vector3(0, 0, 1);
  const alza = (x, y, z) => new THREE.Vector3(x, y + 0.25, z).normalize(); // ~14° de elevación
  const resto = [
    alza(0, 0, 1), alza(0, 0, -1), alza(1, 0, 0), alza(-1, 0, 0),
    alza(1, 0, 1), alza(-1, 0, 1), alza(1, 0, -1), alza(-1, 0, -1),
    new THREE.Vector3(0, 1, 0.3).normalize(), new THREE.Vector3(0, -1, 0.3).normalize(),
  ].sort((a, b) => b.dot(dirActual) - a.dot(dirActual));
  return [dirActual, alza(haciaFuera.x, 0, haciaFuera.z), ...resto];
}

export function focusCameraOnFicha(model, fichaId, camera, controls, opts = {}) {
  const {
    duration = 650,
    force = false,
    // Cuánto se aleja la cámara respecto al tamaño de la estructura. 2.8 deja
    // contexto suficiente para consultar; el examen de señalar pide más, para
    // que la estructura no quede sola en el centro delatándose.
    holgura = 2.8,
    // Un multiplicador a secas no sirve para las dos escalas del catálogo: con
    // 5,5 el pisiforme queda bien encuadrado y el cúbito se va tan lejos que
    // se ve el cuerpo entero. Los topes absolutos acotan el resultado.
    distanciaMin = 0,
    distanciaMax = Infinity,
    // Tope de tiempo para buscar desde qué lado se ve (ver abajo). Con todos
    // los árboles listos no hay tope: la búsqueda completa es barata y el
    // encuadre, determinista. Mientras se construyen (primeros segundos tras
    // el arranque) 300 ms, para que nada congele la interfaz aunque falten
    // árboles; sin la librería, 1000 ms.
    presupuestoMs = arbolesListos() ? Infinity : hayBVH() ? 300 : 1000,
  } = typeof opts === "number" ? { duration: opts } : opts;
  // Acepta una ficha o varias: comparar dos estructuras exige verlas a la vez,
  // y encuadrar solo una deja la otra fuera de pantalla.
  const ids = Array.isArray(fichaId) ? fichaId.filter(Boolean) : [fichaId];
  if (!ids.length) return;

  // El lado se elige por ficha y no sobre el conjunto: si se mezclaran las dos
  // antes de separar, una estructura izquierda y otra derecha parecerían un
  // solo bloque que cruza la línea media y no se partiría ninguna.
  const meshes = ids.flatMap((id) => {
    const suyas = mallasDe(model, id).filter((m) => m.visible);
    return suyas.length ? ladoMasCercano(suyas, controls.target) : [];
  });
  if (!meshes.length) return;

  // Atenúa el lado CONTRALATERAL (la copia no señalada) para que se vea cuál
  // es el que se está mirando: antes ambos lados quedaban idénticos y no se
  // sabía cuál habías clicado. Va antes del posible "return" temprano, porque
  // la atenuación debe aplicarse aunque la cámara no se mueva.
  const elegidas = new Set(meshes);
  for (const id of ids) {
    for (const m of mallasDe(model, id)) {
      if (elegidas.has(m) || !m.userData.baseColor) continue;
      m.material.color.copy(m.userData.baseColor).multiplyScalar(CONTRALATERAL_FADE);
    }
  }
  pedirRender();

  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const m of meshes) {
    m.updateMatrixWorld();
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) continue;
    tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    box.union(tmp);
  }
  if (!isFinite(box.min.x)) return;

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);

  const fovRad = (camera.fov * Math.PI) / 180;
  const distance = Math.min(
    distanciaMax,
    Math.max(distanciaMin, 0.8, ((maxSize / 2) / Math.tan(fovRad / 2)) * holgura),
  );

  const dirActual = camera.position.clone().sub(controls.target).normalize();
  if (dirActual.lengthSq() < 1e-6) dirActual.set(0, 0, 1);

  // ¿Se VE la estructura desde una dirección dada? `necesitaReencuadre` solo
  // mide tamaño y encuadre: una estructura tapada por otras (el infraespinoso
  // mirando de frente) pasaba por "ya se ve bien" y la cámara no se movía.
  const idsSel = new Set(ids);
  const ocluyentes = prepararOcluyentes(
    model.pickables.filter(
      (m) => m.visible && (m.material?.opacity ?? 1) >= 0.4 && !idsSel.has(m.userData.fichaId),
    ),
  );
  const muestras = puntosMuestra(meshes);
  const veDesde = (dir, limite = Infinity) => seVeDesde(dir, center, distance, muestras, ocluyentes, limite);

  // Respeta el encuadre del usuario si la estructura ya se ve bien Y no está tapada.
  // El tope (si lo hay) cuenta desde aquí: incluye esta primera prueba.
  const limite = performance.now() + presupuestoMs;
  if (!force && !necesitaReencuadre(box, camera) && veDesde(dirActual, limite)) return;

  // Si desde la vista actual está oculta, la cámara orbita al primer lado desde
  // el que sí se ve (probando primero la actual y "hacia fuera" del cuerpo).
  //
  // Con BVH (bvh.js) la búsqueda es completa y el encuadre, determinista.
  // Las estructuras enterradas —esfenoides, trigémino, etmoides, palatino,
  // dentro del cráneo— no se ven desde NINGUNA de las 12 direcciones y obligan
  // a probarlas todas; sin aceleración eso eran segundos de interfaz congelada
  // (trigémino 31,7 s en SwiftShader con la máquina cargada). Medido sobre las
  // 412 fichas desde la misma cámara: el encuadre con BVH tarda p50 3,2 ms,
  // p95 13,8 ms, máx 310 ms, frente a 50 ms / 691 ms / 14,7 s sin él, y el
  // destino de la cámara es el MISMO en las 412.
  //
  // Sin la librería (CDN caído) queda un tope de 1000 ms, y de 300 ms
  // mientras los árboles se terminan de construir tras el arranque: si se agota sin
  // encontrar un lado despejado se hace lo que se habría hecho al final,
  // quedarse en la dirección actual. Es un recorte de tiempo, así que ahí sí
  // puede cambiar algún encuadre (medido: 8 de 412 con la máquina cargada).
  let dir = dirActual;
  for (const c of candidatasDireccion(center, dirActual)) {
    if (veDesde(c, limite)) { dir = c; break; }
    if (performance.now() > limite) break;
  }
  const targetCamPos = center.clone().add(dir.clone().multiplyScalar(distance));

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  // El reloj del vuelo arranca en su PRIMER frame, no aquí. Entre este punto y
  // ese frame aún queda el resto de la selección (contorno, ficha, historial) y
  // el primer pintado de la ficha nueva; con el reloj en marcha desde aquí, si
  // eso tardaba lo que dura el vuelo (650 ms, visto en máquinas cargadas) el
  // primer frame ya caía en t = 1 y la cámara saltaba sin animación, y en una
  // normal el vuelo arrancaba ya a medio camino.
  let t0 = null;

  if (activeTween) cancelAnimationFrame(activeTween);
  window.dispatchEvent(new CustomEvent("fisio:camara-vuelo", { detail: QUIEN }));
  function tick(now) {
    if (t0 === null) t0 = now;
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPos, targetCamPos, eased);
    controls.target.lerpVectors(startTarget, center, eased);
    controls.update();
    if (t < 1) activeTween = requestAnimationFrame(tick);
    else activeTween = null;
  }
  activeTween = requestAnimationFrame(tick);
}
