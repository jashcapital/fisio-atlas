import * as THREE from "three";
import { arbolDe } from "./bvh.js";

// Distancia en píxeles a partir de la cual un gesto deja de ser un clic y pasa
// a considerarse un arrastre de cámara.
const DRAG_PX = 5;

// Con el dedo, el umbral es otro. La yema tiembla varios píxeles aunque se
// quiera tocar quieto (Android usa 8 dp de margen y iOS unos 10 pt): con los 5
// px del ratón, un toque normal se tomaba a veces por un giro y no abría nada.
// Y un toque es BREVE: un dedo apoyado más de medio segundo es el principio de
// un giro que aún no ha arrancado, o un dedo descansando, y seleccionar al
// levantarlo sorprende.
const TOQUE_PX = 10;
const TOQUE_MS = 500;
// Dos toques seguidos, cerca y sobre lo mismo (la misma malla o el fondo),
// son un doble toque (ver finToque y el listener de dblclick).
const DOBLE_TOQUE_MS = 400;
const DOBLE_TOQUE_PX = 30;

// Temporales del raycast (sin crear objetos en cada movimiento del ratón).
const _esfera = new THREE.Sphere();
const _aCentro = new THREE.Vector3();
const _impactos = [];

export function createPicker({ canvas, camera, root, pickables, porFicha, onSelect, onHover }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let selected = null;

  // Estado del gesto en curso. Sin esto, rotar el modelo y soltar el botón
  // disparaba un `click` que seleccionaba la malla que hubiera debajo y
  // reencuadraba la cámara: rotar se volvía imposible.
  let downAt = null;
  let arrastrando = false;

  // El raycast contra ~1400 mallas en cada pointermove es caro. Se acumula la
  // última posición y se resuelve una vez por frame.
  let pendiente = null;
  let rafId = 0;

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Malla bajo el puntero.
   *
   * Antes era `intersectObjects(pickables)`: probaba triángulo a triángulo
   * TODAS las mallas cuya esfera cruzara el rayo —de delante a atrás del
   * cuerpo, incluidas las ocultas por capas o por Aislar, que se descartaban
   * después— para quedarse solo con la primera. Ahora se ordenan las visibles
   * por la distancia a la que el rayo entra en su esfera envolvente y se
   * prueban en ese orden; en cuanto hay un impacto sólido, ninguna malla cuya
   * esfera empiece más lejos puede ganarle y se deja de buscar. Mismo
   * resultado, con los fantasmas incluidos (ver abajo).
   */
  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const ray = raycaster.ray;
    const candidatas = [];
    for (const m of pickables) {
      if (!m.visible) continue;
      const g = m.geometry;
      if (!g.boundingSphere) g.computeBoundingSphere();
      _esfera.copy(g.boundingSphere).applyMatrix4(m.matrixWorld);
      // Entrada del rayo en la esfera (0 si el origen ya está dentro).
      _aCentro.subVectors(_esfera.center, ray.origin);
      const tca = _aCentro.dot(ray.direction);
      const d2 = _aCentro.lengthSq() - tca * tca;
      const r2 = _esfera.radius * _esfera.radius;
      if (d2 > r2) continue;
      const thc = Math.sqrt(r2 - d2);
      if (tca + thc < 0) continue; // la esfera queda detrás de la cámara
      candidatas.push({ m, t: Math.max(0, tca - thc) });
    }
    candidatas.sort((a, b) => a.t - b.t);

    // Los fantasmas (rayos X, opacidad < 0.4) son "clic-a-través" SOLO hacia
    // estructuras ENFOCADAS (seleccionada, origen, inserción; focus.js marca
    // `userData.enfoque`). Antes dejaban pasar cualquier clic: pinchabas un
    // músculo fantasma y se seleccionaba el hueso de debajo. Ahora, si lo que
    // hay detrás no está enfocado, gana el músculo que has clicado; y sigues
    // pudiendo pinchar a través de él los huesos teñidos.
    let solido = null;
    let fantasma = null;
    for (const { m, t } of candidatas) {
      if (solido && t > solido.distance) break; // nada más lejos puede ganar
      _impactos.length = 0;
      // Con BVH (bvh.js) el rayo baja por el árbol de la malla en vez de
      // probar todos sus triángulos, y basta el impacto más cercano de cada
      // malla (`firstHitOnly`): es el único que puede decidir. Sin la
      // librería, el raycast de three de siempre.
      const arbol = arbolDe(m.geometry);
      if (arbol) {
        raycaster.firstHitOnly = true;
        arbol.raycastObject3D(m, raycaster, _impactos);
        raycaster.firstHitOnly = false;
      } else {
        m.raycast(raycaster, _impactos);
      }
      if (!_impactos.length) continue;
      const esFantasma = (m.material?.opacity ?? 1) < 0.4;
      for (const hit of _impactos) {
        if (esFantasma) {
          if (!fantasma || hit.distance < fantasma.distance) fantasma = hit;
        } else if (!solido || hit.distance < solido.distance) {
          solido = hit;
        }
      }
    }
    _impactos.length = 0;
    if (solido) {
      if (fantasma && fantasma.distance < solido.distance && !solido.object.userData.enfoque) {
        return fantasma.object;
      }
      return solido.object;
    }
    return fantasma?.object ?? null;
  }

  function resolverHover() {
    rafId = 0;
    const e = pendiente;
    pendiente = null;
    if (!e || arrastrando) return;
    updatePointer(e);
    const mesh = pick();
    canvas.style.cursor = mesh ? "pointer" : "default";
    onHover?.(mesh?.userData.fichaId ?? null, mesh, { x: e.clientX, y: e.clientY });
    hovered = mesh;
  }

  // ---- Táctil ---------------------------------------------------------------
  // Con el dedo el toque se resuelve aquí, en pointerup, y no en el `click`
  // que sintetiza el navegador. Ese `click` dependía de cada navegador: Chrome
  // se comía el primer toque de un doble toque, y tras un doble toque emitía
  // `dblclick`, que limpiaba la selección recién hecha (medido en emulación:
  // dos toques sobre el recto femoral → nada seleccionado). Así el criterio es
  // el mismo en Safari y en Chrome, y es el nuestro:
  //  · un solo dedo en TODO el gesto (un pellizco o un desplazamiento con dos
  //    dedos nunca selecciona, aunque los dedos apenas se muevan o se levanten
  //    de uno en uno);
  //  · que no se haya movido más de TOQUE_PX ni durado más de TOQUE_MS.
  // El gesto empieza con el primer dedo y acaba al levantar el último.
  const toques = new Map(); // pointerId → { x, y, t } de cada dedo apoyado
  let gestoMulti = false;
  let gestoMovido = false;
  let finToqueAt = -Infinity; // cuándo acabó el último gesto táctil
  let ultimoToque = { t: -Infinity, x: 0, y: 0, mesh: null };
  const esDedo = (e) => e.pointerType === "touch";
  // El `click` y el `dblclick` que el navegador emite tras un gesto táctil
  // llegan después del pointerup; en Safari no son PointerEvent, así que se
  // reconocen por tiempo.
  const vieneDeToque = (e) => e.pointerType === "touch" || performance.now() - finToqueAt < 800;

  /** Retira etiqueta, tooltip y contorno de hover (con el dedo no hay hover). */
  function limpiarHover() {
    pendiente = null;
    if (!hovered) return;
    hovered = null;
    onHover?.(null, null, null);
  }

  function finToque(e, cancelado) {
    const ini = toques.get(e.pointerId);
    if (!ini) return; // el dedo no empezó en el visor
    toques.delete(e.pointerId);
    finToqueAt = performance.now();
    // pointercancel: el sistema se ha quedado el gesto (llamada, gesto del
    // borde de la pantalla…). No es un toque.
    if (cancelado) gestoMovido = true;
    if (toques.size || gestoMulti || gestoMovido) return;
    const d = Math.hypot(e.clientX - ini.x, e.clientY - ini.y);
    // Duración con la hora de los EVENTOS (cuándo tocó y levantó el dedo), no
    // con la de cuando se atienden: si el hilo está ocupado (un frame lento, la
    // primera selección), el pointerup se atiende tarde y un toque rápido
    // parecía largo y no seleccionaba (visto en el juez con la máquina cargada).
    if (d > TOQUE_PX || e.timeStamp - ini.t > TOQUE_MS) return;
    updatePointer(e);
    const mesh = pick();
    const previo = ultimoToque;
    const doble =
      e.timeStamp - previo.t < DOBLE_TOQUE_MS &&
      Math.hypot(e.clientX - previo.x, e.clientY - previo.y) < DOBLE_TOQUE_PX;
    ultimoToque = { t: e.timeStamp, x: e.clientX, y: e.clientY, mesh };
    // Segundo toque de un doble toque sobre una estructura: es insistir. Se
    // ignora aunque bajo el dedo haya ya otra malla — la cámara puede estar
    // volando hacia la primera y debajo pasar la vecina.
    if (doble && previo.mesh) return;
    if (!mesh) {
      // Doble toque en el fondo = doble clic (ver el listener de dblclick).
      if (doble) {
        ultimoToque.t = -Infinity; // un tercer toque no cuenta como otro doble
        canvas.dispatchEvent(
          new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2, clientX: e.clientX, clientY: e.clientY }),
        );
      }
      return;
    }
    selectMesh(mesh);
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (esDedo(e)) {
      if (!toques.size) {
        gestoMulti = false;
        gestoMovido = false;
      }
      toques.set(e.pointerId, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      if (toques.size > 1) gestoMulti = true;
      limpiarHover();
      return;
    }
    downAt = { x: e.clientX, y: e.clientY };
    arrastrando = false;
  });

  canvas.addEventListener("pointermove", (e) => {
    if (esDedo(e)) {
      // Sin hover con el dedo: la etiqueta y el tooltip del cursor aparecían
      // bajo la yema al empezar a girar y, en Safari, podían quedarse puestos.
      const ini = toques.get(e.pointerId);
      if (ini && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > TOQUE_PX) gestoMovido = true;
      return;
    }
    if (downAt && !arrastrando) {
      const d = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      if (d > DRAG_PX) {
        // Empieza un arrastre de cámara: se retira la etiqueta de hover para
        // no dejarla flotando mientras el modelo gira.
        arrastrando = true;
        hovered = null;
        canvas.style.cursor = "grabbing";
        onHover?.(null, null, null);
      }
    }
    if (arrastrando) return;
    pendiente = e;
    if (!rafId) rafId = requestAnimationFrame(resolverHover);
  });

  window.addEventListener("pointerup", (e) => {
    if (esDedo(e)) {
      finToque(e, false);
      return;
    }
    downAt = null;
    // `arrastrando` se limpia en el siguiente frame para que el `click` que el
    // navegador emite justo después sepa que venía de un arrastre.
    if (arrastrando) requestAnimationFrame(() => (arrastrando = false));
    canvas.style.cursor = "default";
  });
  window.addEventListener("pointercancel", (e) => {
    if (esDedo(e)) finToque(e, true);
  });

  canvas.addEventListener("pointerleave", (e) => {
    if (esDedo(e)) {
      limpiarHover();
      return;
    }
    hovered = null;
    canvas.style.cursor = "default";
    onHover?.(null, null, null);
  });

  canvas.addEventListener("click", (e) => {
    if (vieneDeToque(e)) return; // el toque ya se resolvió en pointerup
    if (arrastrando) return; // el gesto era rotar o desplazar, no seleccionar
    if (e.detail > 1) return; // segundo clic de un doble clic: lo gestiona main.js
    updatePointer(e);
    const mesh = pick();
    if (!mesh) return;
    selectMesh(mesh);
  });

  // Doble toque: con ratón, el doble clic limpia la selección y vuelve a la
  // vista general (main.js). El `dblclick` que el navegador saca de dos
  // toques se descarta siempre (cada navegador lo emite cuando quiere: Chrome
  // sí, Safari según la versión) y el doble toque lo decide finToque:
  //  · sobre una ESTRUCTURA no hace nada más: el primer toque abre su ficha y
  //    el segundo, que suele ser solo insistir, la cerraba en el acto;
  //  · sobre el FONDO (sin malla debajo) emite su propio `dblclick`, que
  //    main.js trata como el doble clic del ratón. Es la forma de quitar la
  //    selección con el dedo cuando la ficha va en panel fijo (tableta
  //    apaisada), donde no hay Escape ni × que la cierre.
  // Va en captura para adelantarse al listener de main.js en el mismo canvas.
  canvas.addEventListener(
    "dblclick",
    (e) => {
      if (e.isTrusted && vieneDeToque(e)) e.stopImmediatePropagation();
    },
    { capture: true },
  );

  // Evita el menú contextual: el botón derecho desplaza la cámara.
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  function selectMesh(mesh, clicada = true) {
    selected = mesh;
    // focus.js escucha esto para encuadrar el LADO clicado (no el más cercano
    // al target) y atenuar el contralateral, sin pasar por main.js. Va antes
    // de onSelect para que applyFocus/focusCameraOnFicha ya lo tengan.
    //
    // Solo cuando de verdad se ha clicado: `selectById` (barra lateral,
    // buscador, J/K, enlace, Atrás) publicaba la PRIMERA malla de la ficha
    // como si fuera el clic, y focus.js encuadraba siempre ese lado, aunque
    // estuvieras mirando el otro — anulaba su regla de "el lado más próximo a
    // lo que ya se estaba mirando". Sin clic se publica `null`.
    window.dispatchEvent(new CustomEvent("fisio:pick", { detail: { mesh: clicada ? mesh : null } }));
    const fid = mesh.userData.fichaId;
    // `clicada` distingue el clic en el visor de la selección por programa: el
    // examen de señalar solo acepta como respuesta lo primero.
    onSelect?.(fid, mesh, { clicada });
  }

  function selectById(fichaId) {
    const mesh = porFicha
      ? porFicha.get(fichaId)?.[0]
      : pickables.find((m) => m.userData.fichaId === fichaId);
    if (mesh) selectMesh(mesh, false);
  }

  function getSelected() {
    return selected;
  }

  return { selectById, getSelected };
}
