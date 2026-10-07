import * as THREE from "three";

// Evita volver a pedir un recurso ya cargado (los .glb se piden una vez).
THREE.Cache.enabled = true;
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * OutlinePass cuya pasada de profundidad solo dibuja lo que puede tapar lo
 * contorneado.
 *
 * El coste del contorno escalaba con las mallas VISIBLES de la escena, no con
 * las seleccionadas (ROADMAP, C. Rendimiento): para saber qué parte del borde
 * queda oculta, OutlinePass redibuja la escena entera —menos lo seleccionado—
 * en un buffer de profundidad. Pero ese buffer solo se lee en los píxeles que
 * cubre lo seleccionado (la máscara compara la profundidad de cada fragmento
 * seleccionado con la de lo que tiene delante), así que lo que cae fuera del
 * rectángulo de pantalla de la selección, o entero por detrás de su punto más
 * lejano, no puede cambiar ni un píxel del contorno. Aquí se oculta solo
 * durante esa pasada. El aspecto es idéntico por construcción (las pruebas son
 * con esferas envolventes, conservadoras) y se ha comprobado píxel a píxel:
 * 17 frames (5 selecciones + 12 cámaras al azar, cerca y lejos, con y sin
 * hover) leídos con readPixels con recorte y sin él, 0 bytes distintos.
 * Medido con todas las capas y el psoas seleccionado en la vista inicial:
 * 4280 → 2632 draw calls y 7,9 → 5,7 M triángulos por frame; 648 → 362 ms
 * en SwiftShader (el contorno pasa de +541 a +255 ms sobre el frame sin él).
 * Con la estructura pequeña en pantalla el recorte es mayor; pegado a ella,
 * menor, nunca negativo (el propio recorte son ~2136 pruebas de esfera).
 *
 * Se engancha en `_changeVisibilityOfSelectedObjects`, que r186 llama justo
 * antes (false) y justo después (true) de esa pasada. Es un método interno: si
 * una versión futura lo renombra, el recorte simplemente deja de aplicarse y
 * todo sigue funcionando como el OutlinePass original.
 */
class OutlinePassRecortado extends OutlinePass {
  constructor(...args) {
    super(...args);
    /** Mallas que la pasada de profundidad puede omitir (las pickables). */
    this.candidatas = null;
    /** Conmutador para medir A/B desde la consola. */
    this.recorte = true;
    this._recortadas = [];
    this._frustum = new THREE.Frustum();
    this._vp = new THREE.Matrix4();
    this._esf = new THREE.Sphere();
    this._p = new THREE.Vector3();
    this._fwd = new THREE.Vector3();
  }

  _changeVisibilityOfSelectedObjects(bVisible) {
    super._changeVisibilityOfSelectedObjects(bVisible);
    if (bVisible === false) this._recortarProfundidad();
    else this._restaurarProfundidad();
  }

  _recortarProfundidad() {
    const cam = this.renderCamera;
    if (!this.recorte || !this.candidatas || !cam.isPerspectiveCamera) return;
    const vp = this._vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const e = vp.elements;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, wMax = 0;
    for (const mesh of this._selectionCache) {
      const g = mesh.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox;
      if (!bb) return;
      for (let i = 0; i < 8; i++) {
        const p = this._p.set(
          i & 1 ? bb.max.x : bb.min.x,
          i & 2 ? bb.max.y : bb.min.y,
          i & 4 ? bb.max.z : bb.min.z,
        ).applyMatrix4(mesh.matrixWorld);
        const w = e[3] * p.x + e[7] * p.y + e[11] * p.z + e[15];
        // Una esquina detrás de la cámara: la proyección deja de ser un
        // rectángulo fiable. Sin recorte en este frame (el de siempre).
        if (w <= cam.near) return;
        const nx = (e[0] * p.x + e[4] * p.y + e[8] * p.z + e[12]) / w;
        const ny = (e[1] * p.x + e[5] * p.y + e[9] * p.z + e[13]) / w;
        if (nx < x0) x0 = nx;
        if (nx > x1) x1 = nx;
        if (ny < y0) y0 = ny;
        if (ny > y1) y1 = ny;
        if (w > wMax) wMax = w;
      }
    }
    // Margen de 4 px por el filtrado de texturas y el redondeo.
    const mx = 8 / this.resolution.x;
    const my = 8 / this.resolution.y;
    x0 = Math.max(-1, x0 - mx); x1 = Math.min(1, x1 + mx);
    y0 = Math.max(-1, y0 - my); y1 = Math.min(1, y1 + my);
    if (!(x1 > x0 && y1 > y0)) return;

    // Sub-frustum del rectángulo: se reescala la proyección para que
    // [x0,x1]×[y0,y1] ocupe todo el NDC (solo cambian las filas x e y).
    const sx = 2 / (x1 - x0), tx = -(x1 + x0) / (x1 - x0);
    const sy = 2 / (y1 - y0), ty = -(y1 + y0) / (y1 - y0);
    for (let c = 0; c < 4; c++) {
      const i = c * 4;
      e[i] = sx * e[i] + tx * e[i + 3];
      e[i + 1] = sy * e[i + 1] + ty * e[i + 3];
    }
    const fr = this._frustum.setFromProjectionMatrix(vp, cam.coordinateSystem, cam.reversedDepth);
    // Plano lejano (planes[4] en three, con profundidad normal o invertida) en
    // el punto más lejano de la selección (+1 %): lo que está entero detrás no
    // puede taparla.
    cam.getWorldDirection(this._fwd);
    fr.planes[4].normal.copy(this._fwd).negate();
    fr.planes[4].constant = this._fwd.dot(cam.getWorldPosition(this._p)) + wMax * 1.01;

    for (const mesh of this.candidatas) {
      if (!mesh.visible || this._selectionCache.has(mesh)) continue;
      const g = mesh.geometry;
      if (!g.boundingSphere) g.computeBoundingSphere();
      this._esf.copy(g.boundingSphere).applyMatrix4(mesh.matrixWorld);
      if (!fr.intersectsSphere(this._esf)) {
        mesh.visible = false;
        this._recortadas.push(mesh);
      }
    }
  }

  _restaurarProfundidad() {
    for (const m of this._recortadas) m.visible = true;
    this._recortadas.length = 0;
  }
}

/**
 * Tamaño del canvas, nunca cero.
 *
 * Un canvas puede medir 0×0 durante el arranque —pestaña en segundo plano,
 * contenedor aún sin layout— y de ahí salían dos fallos a la vez: `setSize(0,0)`
 * crea framebuffers vacíos (cuatro `GL_INVALID_FRAMEBUFFER_OPERATION` en cada
 * arranque) y `aspect = w / 0` mete Infinity o NaN en la matriz de proyección,
 * que es justo lo que disparaba la red de seguridad de la cámara. Un suelo de
 * 1 px cuesta nada y quita las dos cosas.
 */
function medidas(canvas) {
  return {
    w: Math.max(1, canvas.clientWidth),
    h: Math.max(1, canvas.clientHeight),
  };
}

/**
 * Presupuesto de GPU en pantallas táctiles (tablet y teléfono).
 *
 * El composer reserva por cada píxel del canvas: dos render targets HalfFloat
 * con MSAA (EffectComposer clona el que se le pasa), sus texturas resueltas y
 * los buffers de los dos OutlinePass a resolución completa. Calculado a mano
 * con la configuración de escritorio (pixelRatio 2, MSAA 4×, canvas con
 * antialias): un iPad de 810×1080 px CSS a 2× son 3,5 Mpx de framebuffer y
 * ~550 MB solo en render targets — justo la memoria que hace que Safari de
 * iOS tire el contexto WebGL (pantalla negra). Con lo de abajo (1,5×, MSAA 2×,
 * canvas sin antialias) se queda en ~190 MB, un 65 % menos.
 *
 *  · pixelRatio ≤ 1,5: el texto y la interfaz son DOM y siguen nítidos; lo
 *    único que baja es la resolución interna del modelo, y en una pantalla de
 *    2-3× a 1,5 con MSAA el borde sigue limpio. Además, un tope de píxeles
 *    totales (2,4 Mpx ≈ un iPad Pro 11 apaisado a 1,5×) para que una tableta
 *    grande no se coma el ahorro por superficie.
 *  · MSAA 2× en vez de 4×: la mitad de memoria multimuestreada y todavía
 *    suaviza las siluetas de verdad (FXAA emborrona, ver más abajo).
 *  · Canvas sin `antialias`: el canvas solo recibe el último pase del
 *    composer, un triángulo a pantalla completa sin bordes que suavizar; su
 *    MSAA (color + profundidad ×4) era memoria que no aportaba nada.
 * Se decide con `pointer: coarse` (dedo como puntero principal): un escritorio
 * con ratón, aunque su ventana sea estrecha, se queda exactamente como estaba.
 */
const TACTIL = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
const PR_MAX = TACTIL ? 1.5 : 2;
const PX_MAX_TACTIL = 2.4e6;
const MUESTRAS = TACTIL ? 2 : 4;

/**
 * Calidad reducida tras perder el contexto WebGL: si el visor se cayó por
 * memoria y se recarga desde el aviso, la sesión sigue con pixelRatio 1 y sin
 * MSAA (con FXAA, que es casi gratis) para que no vuelva a caer en bucle. Solo
 * para esta pestaña (sessionStorage).
 */
const CLAVE_CALIDAD = "fisio:gpu-reducida";
function calidadReducida() {
  try {
    return sessionStorage.getItem(CLAVE_CALIDAD) === "1";
  } catch {
    return false;
  }
}

function ratioObjetivo(w, h, reducida) {
  const dpr = window.devicePixelRatio || 1;
  if (reducida) return Math.min(dpr, 1);
  if (!TACTIL) return Math.min(dpr, 2);
  let pr = Math.min(dpr, PR_MAX, Math.sqrt(PX_MAX_TACTIL / (w * h)));
  // Pasos de 0,05: el ratio se recalcula en cada frame y no debe oscilar.
  pr = Math.floor(pr * 20) / 20;
  return Math.max(Math.min(dpr, 1), pr);
}

/**
 * Formato del render target del composer. HalfFloat con MSAA necesita que el
 * color en coma flotante sea renderizable (EXT_color_buffer_float o
 * EXT_color_buffer_half_float); sin eso el framebuffer queda incompleto y el
 * visor sale negro. Se cae a 8 bits, con algo más de banda en los oscuros pero
 * con imagen. Las muestras se ajustan a las que el formato admite de verdad
 * (MAX_SAMPLES es general, y algunas GPU móviles admiten menos para RGBA16F).
 */
function formatoComposer(renderer, muestras) {
  const gl = renderer.getContext();
  const ext = renderer.extensions;
  const maxS = gl.getParameter(gl.MAX_SAMPLES) || 0;
  const flotante = ext.has("EXT_color_buffer_float") || ext.has("EXT_color_buffer_half_float");
  if (!flotante) return { type: THREE.UnsignedByteType, samples: Math.min(muestras, maxS) };
  let samples = Math.min(muestras, maxS);
  try {
    // Pedir menos muestras de las que admite el formato es válido (la GPU
    // redondea hacia arriba a la siguiente que tenga); pedir MÁS que la
    // mayor admitida deja el framebuffer incompleto.
    const admitidas = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA16F, gl.SAMPLES);
    if (admitidas) samples = Math.min(samples, Math.max(0, ...admitidas));
  } catch {
    // Sin la consulta, el tope general de MAX_SAMPLES.
  }
  return { type: THREE.HalfFloatType, samples };
}

/**
 * Crea el renderer o explica en español por qué no se puede. El error de three
 * ("Error creating WebGL context") no le dice nada a quien usa la app.
 */
function crearRenderer(opciones) {
  try {
    return new THREE.WebGLRenderer(opciones);
  } catch (err) {
    const e = new Error(
      "Este navegador no puede mostrar el visor 3D (necesita WebGL 2). " +
        "Prueba con Safari o Chrome actualizados, o reinicia el dispositivo si ya lo están.",
    );
    e.cause = err;
    throw e;
  }
}

/**
 * Aviso de pérdida del contexto WebGL.
 *
 * En un iPhone o un iPad con poca memoria, Safari tira el contexto WebGL de la
 * pestaña cuando la GPU se queda corta (o al volver de otra app pesada). Sin
 * tratarlo, el visor se quedaba en negro y la app parecía colgada, sin una sola
 * palabra. Ahora:
 *  · `preventDefault` en `webglcontextlost` le dice al navegador que la app
 *    sabe recuperarse (sin él, el contexto no vuelve nunca);
 *  · se avisa en español y se ofrece recargar — la estructura abierta está en
 *    la URL, así que la recarga vuelve a ella;
 *  · si el navegador lo restaura, three rehace su estado, se regenera lo que
 *    solo vivía en la GPU y el aviso cambia a "ya puedes seguir";
 *  · si no vuelve en unos segundos, el aviso lo dice y la recarga entra con
 *    calidad reducida (ver CLAVE_CALIDAD) para no caer otra vez.
 * Se prueba con la extensión WEBGL_lose_context (área `tactil` del juez).
 */
function avisoContexto(canvas, { alPerder, alRecuperar }) {
  let caja = null;
  let tEspera = 0;
  let tCierre = 0;

  function pintar(estado) {
    if (!caja) {
      caja = document.createElement("div");
      caja.className = "viewer__contexto";
      caja.id = "viewer-contexto";
      caja.setAttribute("role", "alert");
      canvas.parentElement?.append(caja);
    }
    clearTimeout(tCierre);
    caja.hidden = false;
    caja.dataset.estado = estado;
    const textos = {
      perdido: [
        "El visor 3D se ha detenido",
        "El dispositivo se ha quedado sin memoria para el modelo 3D. Intentando recuperarlo…",
      ],
      atascado: [
        "El visor 3D no se ha podido recuperar",
        "Pulsa «Recargar el visor»: volverá a abrirse con algo menos de calidad de imagen para que no se repita. La estructura que estabas viendo se conserva.",
      ],
      recuperado: [
        "El visor 3D se reinició por falta de memoria",
        "Ya puedes seguir donde estabas.",
      ],
    };
    const [titulo, cuerpo] = textos[estado];
    caja.innerHTML = `<strong></strong><p></p>${
      estado === "recuperado"
        ? ""
        : '<button type="button" class="viewer__contexto-btn">Recargar el visor</button>'
    }`;
    caja.querySelector("strong").textContent = titulo;
    caja.querySelector("p").textContent = cuerpo;
    caja.querySelector("button")?.addEventListener("click", () => {
      try {
        sessionStorage.setItem(CLAVE_CALIDAD, "1");
      } catch {
        // Sin almacenamiento, se recarga con la calidad de siempre.
      }
      location.reload();
    });
    if (estado === "recuperado") tCierre = setTimeout(() => (caja.hidden = true), 5000);
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    // Un canvas sin contexto se pinta en blanco: un rectángulo cegador detrás
    // del aviso. Oculto, se ve el fondo oscuro de la página.
    canvas.style.visibility = "hidden";
    alPerder();
    pintar("perdido");
    clearTimeout(tEspera);
    tEspera = setTimeout(() => pintar("atascado"), 8000);
  });
  canvas.addEventListener("webglcontextrestored", () => {
    clearTimeout(tEspera);
    canvas.style.visibility = "";
    try {
      alRecuperar();
      pintar("recuperado");
    } catch (err) {
      console.warn("[fisio-atlas] el contexto WebGL volvió pero no se pudo rehacer la escena", err);
      pintar("atascado");
    }
  });
}

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#16110d");

  const camera = new THREE.PerspectiveCamera(
    35,
    medidas(canvas).w / medidas(canvas).h,
    0.05,
    500,
  );
  camera.position.set(0, 0, 6);

  const reducida = calidadReducida();
  const renderer = crearRenderer({
    canvas,
    // Ver TACTIL arriba: en táctil el antialias del canvas es memoria sin efecto.
    antialias: !TACTIL && !reducida,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(ratioObjetivo(medidas(canvas).w, medidas(canvas).h, reducida));
  renderer.setSize(medidas(canvas).w, medidas(canvas).h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05; // 1,2 sobreexponía el rojo hacia naranja

  // Realismo sin texturas: los materiales son color plano y, solo con luces
  // direccionales, músculo y hueso se ven como plástico. Un entorno neutro
  // (PMREM, incluido en three, sin assets) aporta reflejos suaves y luz
  // ambiente con dirección, que es lo que da volumen al tejido. Intensidad
  // contenida para no lavar el color.
  //
  // Es una función porque tras perder el contexto WebGL la textura del entorno
  // vuelve vacía (vive solo en la GPU): sin regenerarla, el modelo se veía
  // apagado después de recuperarse.
  //
  // PMREMGenerator dibuja SIEMPRE en HalfFloat. En una GPU que no puede
  // renderizar en coma flotante (la misma que obliga al composer a ir a 8
  // bits) cada pasada fallaba con GL_INVALID_FRAMEBUFFER_OPERATION y dejaba
  // el entorno en negro igualmente: ahí se prescinde de él y quedan las luces.
  const formato = formatoComposer(renderer, reducida ? 0 : MUESTRAS);
  let entornoRT = null;
  function generarEntorno() {
    if (formato.type !== THREE.HalfFloatType) {
      scene.environment = null;
      return;
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const anterior = entornoRT;
    const sala = new RoomEnvironment();
    entornoRT = pmrem.fromScene(sala, 0.04);
    scene.environment = entornoRT.texture;
    pmrem.dispose();
    sala.dispose?.();
    anterior?.dispose();
  }
  generarEntorno();
  // 0,55 daba brillo de plástico sobre el músculo; 0,3 aporta volumen sin lacar.
  scene.environmentIntensity = 0.3;

  // Lighting — warm key, cool rim, hemispheric ambient
  const hemi = new THREE.HemisphereLight(0xeaf0ff, 0x1a1f28, 0.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2e0, 1.5);
  key.position.set(4, 6, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6ec1ff, 0.95);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffe0c4, 0.45);
  fill.position.set(3, -2, 4);
  scene.add(fill);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  // Damping más vivo: con 0.09 cada gesto arrastraba una inercia larga y el
  // zoom se sentía pastoso.
  controls.dampingFactor = 0.14;
  controls.rotateSpeed = 0.9;
  // Valor de partida; se reajusta por evento según sea rueda o trackpad (abajo).
  // La rueda multiplica la distancia por 0.95^zoomSpeed en cada tick: con el 1.0
  // original eso era un 5 % por tick, casi treinta ticks para ir de la vista
  // general al detalle de un músculo.
  controls.zoomSpeed = 2.4;
  controls.panSpeed = 1.3;
  controls.screenSpacePanning = true; // desplazar en el plano de la pantalla, no sobre el suelo
  // Zoom hacia el cursor: sin esto la rueda siempre acerca al centro del
  // modelo, así que para mirar un músculo del pie te acercabas al ombligo.
  // Era la causa de fondo de "no me deja acercarme".
  controls.zoomToCursor = true;
  // Límites pensados para el modelo actual (cuerpo entero, 3,4 unidades de
  // alto): hay que poder pegarse a una falange y alejarse a ver el conjunto.
  controls.minDistance = 0.12;
  controls.maxDistance = 26;

  // OrbitControls aplica el mismo factor de zoom en CADA evento `wheel`, sin
  // mirar la magnitud del delta. Una rueda de ratón emite un evento con
  // deltaY ~100-120; un trackpad emite decenas seguidos con deltaY ~2-10. Con
  // una sola velocidad, o la rueda va pastosa o el trackpad se dispara. Se
  // ajusta la velocidad según el dispositivo que esté generando el evento.
  const ZOOM_RUEDA = 2.4;
  // El valor del trackpad es una estimación: un gesto típico son 20-40 eventos,
  // y a 0,8 eso da en torno a un 60 % de acercamiento por deslizamiento. No se
  // ha podido validar con hardware real desde aquí (los eventos sintéticos no
  // reproducen la cadencia de un trackpad), así que queda como parámetro a
  // ajustar si resulta brusco o corto en uso real.
  const ZOOM_TRACKPAD = 0.8;
  canvas.addEventListener(
    "wheel",
    (e) => {
      // deltaMode 1 (líneas) o 2 (páginas) siempre viene de una rueda;
      // deltaMode 0 (píxeles) con delta grande, también.
      const esRueda = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 50;
      controls.zoomSpeed = esRueda ? ZOOM_RUEDA : ZOOM_TRACKPAD;
    },
    { capture: true, passive: true },
  );
  // El pellizco usa la MISMA velocidad, pero como exponente de la razón entre
  // la distancia de los dedos al principio y al final (OrbitControls:
  // distancia × (d0/d1)^zoomSpeed). Con el 2,4 de la rueda, separar los dedos
  // al triple acercaba la cámara 14 veces (medido en emulación: de 6,1 a 0,44):
  // un pellizco pequeño atravesaba el modelo. Con 1 el modelo sigue a los
  // dedos: separarlos al doble lo ve el doble de grande.
  const ZOOM_PELLIZCO = 1;
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") controls.zoomSpeed = ZOOM_PELLIZCO;
    },
    { capture: true, passive: true },
  );
  // Safari de iOS tiene sus propios eventos de gesto y, en versiones que no
  // respetan del todo `touch-action: none`, el pellizco sobre el canvas hacía
  // además zoom de TODA la página (cabecera y paneles incluidos). Solo
  // existen en Safari; en el resto de navegadores no llegan nunca.
  for (const tipo of ["gesturestart", "gesturechange", "gestureend"]) {
    canvas.addEventListener(tipo, (e) => e.preventDefault(), { passive: false });
  }

  // Botón derecho y central también desplazan: Shift+arrastrar es poco obvio.
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  // En táctil: un dedo rota, dos dedos hacen zoom y desplazan.
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.target.set(0, 0, 0);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.2; // slow turntable, ~degrees/sec at 60fps

  // Auto-rotate stops whenever the user touches the mouse inside the canvas.
  let autoRotateWasOn = false;
  canvas.addEventListener("pointerdown", () => {
    if (controls.autoRotate) {
      autoRotateWasOn = true;
      controls.autoRotate = false;
      window.dispatchEvent(new CustomEvent("autorotate:changed", { detail: false }));
    } else {
      autoRotateWasOn = false;
    }
  });

  // Post-processing pipeline: Render → Outline → FXAA → Output
  // `antialias: true` del renderer NO se aplica aquí: el composer renderiza a
  // un render target propio, y por defecto ese target no tiene multisampling.
  // Solo quedaba FXAA, que deja las siluetas en escalera ("pixelado"). Con un
  // target MSAA de 4 muestras (WebGL2) la escena se suaviza de verdad; FXAA
  // sigue detrás para los bordes de brillo del contorno.
  //
  // En táctil van 2 muestras y no 4, y el formato baja a 8 bits si la GPU no
  // puede renderizar en coma flotante (ver TACTIL y formatoComposer arriba).
  const pr0 = renderer.getPixelRatio();
  const msaaTarget = new THREE.WebGLRenderTarget(
    Math.round(medidas(canvas).w * pr0),
    Math.round(medidas(canvas).h * pr0),
    formato,
  );
  const composer = new EffectComposer(renderer, msaaTarget);
  composer.setPixelRatio(pr0);
  composer.setSize(medidas(canvas).w, medidas(canvas).h);

  // Render BAJO DEMANDA. Antes se dibujaban 60 frames/s siempre, aunque nada
  // cambiara: ~20 ms de GPU por frame quieto (MSAA + dos contornos) en calor,
  // batería y memoria. Ahora solo se dibuja cuando algo cambia, y quien lo
  // cambia avisa:
  //   · la cámara → evento `change` de OrbitControls (arrastre, rueda, damping,
  //     auto-rotación, vuelos y flechas, que llaman a controls.update());
  //   · contorno de selección/hover → se detecta por identidad en animate();
  //   · colores, transparencias y visibilidad → evento `fisio:render`
  //     (layers.js, focus.js, Aislar en main.js);
  //   · tamaño o densidad de píxeles → resize().
  //
  // Se quitaron tres atajos que dibujaban de más, medidos con la escena
  // entera (2136 mallas) y una estructura seleccionada:
  //   · `pointermove` sobre el canvas: CADA movimiento del ratón redibujaba la
  //     escena completa con sus dos contornos, aunque no cambiara nada — 36
  //     renders para 40 movimientos, y 14 para 20 movimientos de 1 px dentro
  //     de la misma estructura. Pasar el ratón por encima ya no dibuja salvo
  //     que cambie la estructura bajo el cursor.
  //   · `keydown` en todo el documento: cada tecla pulsada en el buscador o en
  //     las notas costaba un frame completo del visor.
  //   · el latido de 1 frame/s: tapaba justamente los avisos que faltaban (los
  //     vuelos de cámara iban a saltos, ver abajo) y costaba un frame completo
  //     por segundo en reposo, que se notaba como un tirón periódico al hacer
  //     scroll en la ficha.
  // Además, los vuelos de cámara NO se veían: `flyTo` y el encuadre de
  // focus.js llaman a controls.update() en su propio requestAnimationFrame,
  // que corre DESPUÉS de animate(); cuando animate() llamaba a update() la
  // cámara ya estaba "al día" y devolvía false. Resultado medido: 2 frames
  // dibujados en todo un vuelo de 650 ms — la cámara saltaba. El evento
  // `change` los cubre.
  let dirty = true;
  function requestRender() { dirty = true; }
  controls.addEventListener("change", requestRender);
  window.addEventListener("fisio:render", requestRender);
  // Pérdida del contexto WebGL (ver avisoContexto más abajo): mientras dura no
  // se dibuja nada, y al recuperarse hay que regenerar el entorno y pedir el
  // frame. three restaura su propio estado por su cuenta.
  let contextoPerdido = false;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestRender();
  });

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Contorno a resolución completa.
  //
  // Estuvo a 0,5 con este razonamiento: "cada OutlinePass re-dibuja la escena
  // entera para su máscara de profundidad, y a resolución completa eso triplica
  // el coste". Dos cosas estaban mal.
  //
  // La primera, que el ahorro no existe donde se creía: `syncOutlineCost()`
  // APAGA los dos contornos mientras la cámara se mueve, así que durante el
  // arrastre —el único momento en que la fluidez importa— no se renderizaba
  // ninguno. Media resolución solo degradaba la imagen en reposo, que es
  // exactamente cuando el usuario está quieto identificando una estructura.
  //
  // La segunda, que el coste es otro. Medido a 1440×900 con 25 renders
  // sincronizados con `gl.finish()`: sin contorno 14,7 ms; a media resolución
  // 20,0 ms; a resolución completa 21,2 ms. La resolución del buffer cuesta
  // 1,2 ms — el resto es el re-render de la escena, que se paga igual. Se
  // estaba pixelando el borde para ahorrar un 6 %.
  const OUTLINE_SCALE = 1;
  // En píxeles de DISPOSITIVO: pasarle clientWidth (px CSS) en una pantalla 2×
  // dejaba el contorno a la mitad de la resolución del frame.
  const outlineRes = () => {
    const pr = renderer.getPixelRatio();
    return new THREE.Vector2(
      Math.max(1, Math.round(canvas.clientWidth * pr * OUTLINE_SCALE)),
      Math.max(1, Math.round(canvas.clientHeight * pr * OUTLINE_SCALE)),
    );
  };

  const outlineSelect = new OutlinePassRecortado(outlineRes(), scene, camera);
  outlineSelect.edgeStrength = 5.5;
  // El halo usa un radio fijo dentro del propio pase, así que con la textura al
  // doble de resolución ocupa la mitad de pantalla. Se sube la intensidad para
  // no perder la luz que da la profundidad sobre fondo oscuro.
  outlineSelect.edgeGlow = 1.3;
  // El desenfoque del contorno mide su radio en TÉXELES de la textura de borde,
  // no en píxeles de pantalla. Al pasar `downSampleRatio` de 2 a 1 esa textura
  // dobla su resolución, así que el mismo valor da un trazo la mitad de grueso:
  // hay que doblarlo para conservar el grosor que ya estaba elegido.
  outlineSelect.edgeThickness = 2.8;
  outlineSelect.pulsePeriod = 0;
  outlineSelect.visibleEdgeColor.set("#4fc3f7");
  outlineSelect.hiddenEdgeColor.set("#1b4a6a");
  composer.addPass(outlineSelect);

  const outlineHover = new OutlinePassRecortado(outlineRes(), scene, camera);
  outlineHover.edgeStrength = 3.0;
  outlineHover.edgeGlow = 0.3;
  outlineHover.edgeThickness = 0.8; // se queda en downSampleRatio 2: grosor original
  outlineHover.pulsePeriod = 0;
  outlineHover.visibleEdgeColor.set("#9ee3ff");
  outlineHover.hiddenEdgeColor.set("#0e2a3a");
  composer.addPass(outlineHover);

  // `downSampleRatio` es el downsample INTERNO de OutlinePass: con el valor por
  // defecto (2) el trazo sale a media resolución y el halo a un cuarto. Ese era
  // el pixelado que se veía al acercarse, multiplicado además por el antiguo
  // OUTLINE_SCALE de 0,5 — borde a 1/4 del frame y halo a 1/8.
  //
  // Medido a 1440×900, coste del pase sobre una escena sin contorno:
  //   downSampleRatio 1 → +20,4 ms     downSampleRatio 2 → +10,9 ms
  //
  // Así que se reparte: el contorno de SELECCIÓN va a 1, porque es el que se
  // mira fijamente mientras se identifica una estructura y es donde se notaba
  // la escalera. El de HOVER se queda en 2: es transitorio, más fino y nadie
  // lo estudia — y es el que se dispara al pasear el ratón, justo cuando la
  // fluidez importa. Sale por ~15 ms en vez de ~20,4 con los dos activos.
  outlineSelect.downSampleRatio = 1;
  outlineHover.downSampleRatio = 2;
  for (const pass of [outlineSelect, outlineHover]) {
    const r = outlineRes();
    pass.setSize(r.x, r.y);
    // OutlinePass crea sus buffers internos en HalfFloat. Sin color en coma
    // flotante (ver formatoComposer) no se podrían dibujar y el contorno
    // fallaría con errores de WebGL: pasan a 8 bits antes de crearse en la
    // GPU. La profundidad se empaqueta en RGBA (RGBADepthPacking), que es
    // justo el formato pensado para 8 bits.
    if (formato.type !== THREE.HalfFloatType) {
      for (const v of Object.values(pass)) {
        if (v?.isWebGLRenderTarget && v.texture.type === THREE.HalfFloatType) v.texture.type = THREE.UnsignedByteType;
      }
    }
  }

  const fxaa = new ShaderPass(FXAAShader);
  // Con MSAA real en el composer, FXAA ya no suaviza nada: solo emborrona el
  // frame (era el "todo se ve borroso"). Se deja creado por si hiciera falta
  // en un dispositivo sin WebGL2, pero apagado. Solo se enciende en calidad
  // reducida (tras perder el contexto), donde no hay MSAA.
  fxaa.enabled = reducida;
  // Cada OutlinePass re-renderiza la escena entera para construir su máscara de
  // profundidad. Con 1191 mallas eso son dos pasadas completas por frame que la
  // mayor parte del tiempo no dibujan nada: sin selección ni hover no hay
  // contorno que trazar. Se desactivan mientras su lista esté vacía.
  // Mientras se mueve la cámara los contornos se apagan. Medido: con una
  // estructura seleccionada el coste por frame pasa de 11 a 35 ms, es decir de
  // 59 a 28 fps — justo cuando se está arrastrando y la fluidez es lo único que
  // importa. Al soltar vuelven de inmediato.
  //
  // (Se descartó por medición compartir materiales, que era el candidato
  // obvio: pasar de 1733 materiales a 4 solo daba un 3,6 %, y exigía
  // refactorizar focus.js, que hoy funciona bien.)
  //
  // "Se mueve" es que la cámara CAMBIE durante el gesto, no que se pulse el
  // botón: OrbitControls emite `start` en el pointerdown, así que un simple
  // clic —para seleccionar— apagaba el contorno entre el pointerdown y el
  // pointerup (un parpadeo del contorno en cada clic) y costaba dos frames
  // completos de más antes del de la selección.
  let camaraEnMovimiento = false;
  let gesto = false;
  controls.addEventListener("start", () => {
    gesto = true;
    // El usuario coge la cámara: cualquier vuelo en marcha se detiene. Antes el
    // vuelo seguía escribiendo la posición en cada frame y le "peleaba" el
    // arrastre o la rueda durante sus 650 ms.
    cancelarVuelos("usuario");
  });
  controls.addEventListener("change", () => {
    if (gesto) camaraEnMovimiento = true;
  });
  controls.addEventListener("end", () => {
    gesto = false;
    camaraEnMovimiento = false;
  });

  function syncOutlineCost() {
    const moviendo = camaraEnMovimiento || controls.autoRotate;
    outlineSelect.enabled = !moviendo && outlineSelect.selectedObjects.length > 0;
    outlineHover.enabled = !moviendo && outlineHover.selectedObjects.length > 0;
  }

  // (el FXAA se añade DESPUÉS del OutputPass, más abajo)

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // FXAA va detrás del OutputPass, no delante. Está diseñado para trabajar
  // sobre valores ya comprimidos a rango bajo y codificados a sRGB —así lo hace
  // el ejemplo oficial de three r186—. Delante operaba sobre lineal HDR, con
  // sus umbrales de luma calibrados para otra escala: sobre un fondo casi negro
  // frente a un contorno muy brillante, suavizaba donde no tocaba.
  composer.addPass(fxaa);

  function updateFxaaResolution(w, h) {
    const pr = renderer.getPixelRatio();
    fxaa.material.uniforms["resolution"].value.set(1 / (w * pr), 1 / (h * pr));
  }
  updateFxaaResolution(medidas(canvas).w, medidas(canvas).h);

  function resize() {
    const { w, h } = medidas(canvas);
    // El pixelRatio se fijaba SOLO al crear la escena. Si el canvas aún no
    // tenía layout, o si la ventana cambia de monitor o de zoom, se quedaba
    // congelado en el valor de arranque: medido, un renderer a 1 en una
    // pantalla de 1,25 — todo el modelo renderizado por debajo de su
    // resolución nativa. Cuesta 0 ms corregirlo (medido: 20,0 ms a 1,25 frente
    // a 20,7 ms a 1, indistinguible) y lo afina todo, no solo el contorno.
    const pr = ratioObjetivo(w, h, reducida);
    const cambioRatio = renderer.getPixelRatio() !== pr;
    if (cambioRatio) {
      renderer.setPixelRatio(pr);
      composer.setPixelRatio(pr);
    }
    // `setPixelRatio` por sí solo no regenera el buffer: sin forzar el
    // `setSize`, un cambio de ratio sin cambio de tamaño CSS no haría nada.
    if (cambioRatio || canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr)) {
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      const ow = Math.max(1, Math.round(w * pr * OUTLINE_SCALE));
      const oh = Math.max(1, Math.round(h * pr * OUTLINE_SCALE));
      outlineSelect.setSize(ow, oh);
      outlineHover.setSize(ow, oh);
      updateFxaaResolution(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      requestRender();
    }
  }

  // Red de seguridad contra estados de cámara inválidos.
  // `zoomToCursor` desproyecta el punto bajo el cursor y normaliza la dirección
  // resultante; si ese punto coincide con la posición de la cámara, el vector
  // es cero y `normalize()` devuelve NaN. A partir de ahí la matriz de la
  // cámara se corrompe y la escena desaparece en negro, sin ningún error en
  // consola. Se conserva el último estado válido y se restaura si ocurre.
  const ultimaPosValida = camera.position.clone();
  const ultimoTargetValido = controls.target.clone();
  let avisadoNaN = false;
  function guardarCamaraValida() {
    const ok =
      Number.isFinite(camera.position.x) &&
      Number.isFinite(camera.position.y) &&
      Number.isFinite(camera.position.z) &&
      Number.isFinite(controls.target.x) &&
      Number.isFinite(controls.target.y) &&
      Number.isFinite(controls.target.z);
    if (ok) {
      ultimaPosValida.copy(camera.position);
      ultimoTargetValido.copy(controls.target);
      return;
    }
    camera.position.copy(ultimaPosValida);
    controls.target.copy(ultimoTargetValido);
    camera.updateProjectionMatrix();
    controls.update();
    if (!avisadoNaN) {
      avisadoNaN = true;
      console.warn("[fisio-atlas] la cámara alcanzó un estado inválido (NaN) y se ha restaurado.");
    }
  }

  let prevSel = null, prevHov = null, prevSelOn = null, prevHovOn = null;
  function animate() {
    requestAnimationFrame(animate);
    resize();
    // update() aplica damping y auto-rotación; si mueve la cámara emite
    // `change`, que ya pide el frame.
    controls.update();
    guardarCamaraValida();
    syncOutlineCost();
    // Cambios de selección/hover llegan reasignando `selectedObjects` (y
    // syncOutlineCost cambia `enabled`): se detectan por identidad, sin que
    // main.js tenga que avisar.
    if (
      outlineSelect.selectedObjects !== prevSel || outlineHover.selectedObjects !== prevHov ||
      outlineSelect.enabled !== prevSelOn || outlineHover.enabled !== prevHovOn
    ) {
      dirty = true;
      prevSel = outlineSelect.selectedObjects; prevHov = outlineHover.selectedObjects;
      prevSelOn = outlineSelect.enabled; prevHovOn = outlineHover.enabled;
    }
    if (!dirty || contextoPerdido) return;
    dirty = false;
    composer.render();
  }
  animate();

  avisoContexto(canvas, {
    alPerder() {
      contextoPerdido = true;
    },
    alRecuperar() {
      contextoPerdido = false;
      generarEntorno();
      requestRender();
    },
  });

  window.addEventListener("resize", resize);

  // Transición de cámara suave (animada) para vistas y "volver al inicio".
  // Un solo vuelo a la vez entre este y el encuadre de focus.js: quien empieza
  // uno lo anuncia con `fisio:camara-vuelo` y el resto se cancela (ver focus.js).
  let viewTween = null;
  function cancelarVuelos(quien) {
    window.dispatchEvent(new CustomEvent("fisio:camara-vuelo", { detail: quien }));
  }
  window.addEventListener("fisio:camara-vuelo", (e) => {
    if (e.detail !== "vista" && viewTween) {
      cancelAnimationFrame(viewTween);
      viewTween = null;
    }
  });
  function flyTo(pos, target, duration = 620) {
    if (viewTween) cancelAnimationFrame(viewTween);
    cancelarVuelos("vista");
    const startPos = camera.position.clone();
    const startTgt = controls.target.clone();
    const endPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    const endTgt = new THREE.Vector3(target[0], target[1], target[2]);
    let t0 = null; // el reloj arranca en el primer frame (ver focus.js)
    function tick(now) {
      if (t0 === null) t0 = now;
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      camera.position.lerpVectors(startPos, endPos, e);
      controls.target.lerpVectors(startTgt, endTgt, e);
      controls.update();
      if (t < 1) viewTween = requestAnimationFrame(tick);
      else viewTween = null;
    }
    viewTween = requestAnimationFrame(tick);
  }

  // Dimensiones del modelo cargado. Sin ellas se usa un valor prudente; main.js
  // las fija en cuanto el modelo está en escena.
  let modelSize = { x: 1.6, y: 3.4, z: 0.7 };
  function setModelBounds(size) {
    if (size && size.x > 0 && size.y > 0 && size.z > 0) modelSize = size;
  }

  /**
   * Ancho del canvas que NO tapan los paneles flotantes. En escritorio la barra
   * lateral y la ficha ocupan casi la mitad del visor, así que encuadrar contra
   * el canvas completo deja el modelo escondido detrás de ellos.
   */
  function usableWidthRatio() {
    const cw = canvas.clientWidth;
    if (!cw) return 1;
    const sidebar = document.getElementById("sidebar");
    const info = document.getElementById("info-panel");
    let left = 0;
    let right = cw;
    // Si están dentro de un drawer no ocupan sitio: el visor es todo el ancho.
    if (sidebar && !sidebar.closest("sl-drawer")) {
      left = Math.max(left, sidebar.getBoundingClientRect().right);
    }
    if (info && !info.closest("sl-drawer")) {
      right = Math.min(right, info.getBoundingClientRect().left);
    }
    return Math.max(0.25, (right - left) / cw);
  }

  /**
   * Distancia mínima para que un rectángulo de `w` x `h` unidades quepa entero,
   * contando el FOV vertical, la relación de aspecto y el hueco libre real.
   * Antes era una constante `d = 6` pensada para medio cuerpo: al incorporar el
   * miembro inferior el modelo quedaba pequeño y con mucho aire sobrante.
   */
  function fitDistance(w, h, margin = 1.14) {
    const vFov = (camera.fov * Math.PI) / 180;
    const tanV = Math.tan(vFov / 2);
    const dV = (h * margin) / 2 / tanV;
    const aspect = camera.aspect * usableWidthRatio();
    const dH = (w * margin) / 2 / (tanV * aspect);
    return Math.max(dV, dH, 1.2);
  }

  function setView(preset) {
    const { x, y, z } = modelSize;
    // Cada vista proyecta dimensiones distintas: de frente manda la altura, de
    // perfil la profundidad, y desde arriba la planta, que es mucho más chata.
    const dFront = fitDistance(x, y);
    const dSide = fitDistance(z, y);
    const dTop = fitDistance(x, z);
    const presets = {
      front:    { pos: [0, 0, dFront],  target: [0, 0, 0] },
      back:     { pos: [0, 0, -dFront], target: [0, 0, 0] },
      lateral:  { pos: [dSide, 0, 0],   target: [0, 0, 0] },   // right side
      medial:   { pos: [-dSide, 0, 0],  target: [0, 0, 0] },   // left side (towards midline)
      superior: { pos: [0, dTop, 0.01],  target: [0, 0, 0] },
      inferior: { pos: [0, -dTop, 0.01], target: [0, 0, 0] },
      reset:    { pos: [0, 0, dFront],  target: [0, 0, 0] },
    };
    const p = presets[preset] || presets.reset;
    flyTo(p.pos, p.target);
  }

  // Rotate camera around target by delta angles (radians)
  function rotate(deltaAzimuth, deltaElevation) {
    cancelarVuelos("usuario"); // las flechas también son "coger la cámara"
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta -= deltaAzimuth;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaElevation));
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    controls.update();
  }

  function toggleAutoRotate() {
    controls.autoRotate = !controls.autoRotate;
    window.dispatchEvent(new CustomEvent("autorotate:changed", { detail: controls.autoRotate }));
    return controls.autoRotate;
  }

  function isAutoRotating() {
    return controls.autoRotate;
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    composer,
    outlineSelect,
    outlineHover,
    setView,
    setModelBounds,
    rotate,
    toggleAutoRotate,
    isAutoRotating,
    requestRender,
  };
}
