import * as THREE from "three";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { createScene } from "./viewer/scene.js";
import { loadModel } from "./viewer/loader.js";
import { createPicker } from "./viewer/picker.js";
import { createLayers, LAYERS } from "./viewer/layers.js";
import { applyFocus, clearFocus, focusCameraOnFicha } from "./viewer/focus.js";
import { bvhListo, bvhStats, precalcularArboles, usarBVH } from "./viewer/bvh.js";
import { loadDb } from "./data/db.js";
import { initInfoPanel } from "./ui/info-panel.js";
import { initLightbox } from "./ui/gallery.js";
import { initSidebar, setBreadcrumb } from "./ui/sidebar.js";
import { initSearch } from "./ui/search.js";
import { initLayout } from "./ui/layout.js";
import { idFromHash, writeHash, onNavigate, remember } from "./ui/session.js";
import { initQuiz } from "./ui/quiz.js";
import { ripple, press } from "./ui/motion.js";
import { initComparar } from "./ui/comparar.js";
import { initDisparadores } from "./ui/dialogos.js";
import { initGuia } from "./ui/guia.js";
import { initAcerca } from "./ui/acerca.js";
import { initDatos } from "./ui/datos.js";

const ICON_RESET = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>`;
const ICON_FRAME = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><circle cx="12" cy="12" r="2.5"/></svg>`;
const ICON_ISOLATE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></svg>`;
const ICON_HELP = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".6" fill="currentColor"/><circle cx="12" cy="12" r="9"/></svg>`;
const ICON_ROTATE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>`;

// Barra de vistas: cada botón va envuelto en <sl-tooltip> (Shoelace) en vez
// de un `title` nativo. `hoist` lo saca del contenedor deslizable en móvil.
const VIEWER_CONTROLS = [
  { action: "reset-camera", tip: "Volver a la vista general (Esc)", icon: ICON_RESET },
  "divider",
  { action: "view-front", label: "Ant", tip: "Vista anterior (1)" },
  { action: "view-back", label: "Post", tip: "Vista posterior (3)" },
  { action: "view-lateral", label: "Lat", tip: "Vista lateral derecha (2)" },
  { action: "view-medial", label: "Med", tip: "Vista medial (desde la izquierda)" },
  { action: "view-superior", label: "Sup", tip: "Vista superior" },
  { action: "view-inferior", label: "Inf", tip: "Vista inferior" },
  "divider",
  { action: "autorotate", id: "btn-autorotate", tip: "Auto-rotación (Espacio)", icon: ICON_ROTATE },
  { action: "frame", id: "btn-frame", tip: "Encuadrar la estructura seleccionada", icon: ICON_FRAME },
  { action: "isolate", id: "btn-isolate", tip: "Aislar: ocultar todo salvo lo seleccionado (A)", icon: ICON_ISOLATE },
  { action: "help", id: "btn-help", tip: "Controles del visor", icon: ICON_HELP },
];

function renderViewerControls(el) {
  el.innerHTML = VIEWER_CONTROLS.map((c) =>
    c === "divider"
      ? `<span class="viewer__divider"></span>`
      : `<sl-tooltip content="${c.tip}" placement="bottom" hoist>
           <button type="button" data-action="${c.action}"${c.id ? ` id="${c.id}"` : ""} aria-label="${c.tip}">${c.icon ?? c.label}</button>
         </sl-tooltip>`,
  ).join("");
}

async function boot() {
  const canvas = document.getElementById("viewer-canvas");
  const loader = document.getElementById("viewer-loader");
  const loaderMsg = document.getElementById("viewer-loader-msg");
  const loaderBar = document.getElementById("viewer-loader-bar");
  const notice = document.getElementById("viewer-notice");
  const hoverLabel = document.getElementById("hover-label");
  const infoPanelEl = document.getElementById("info-panel");

  const layout = initLayout();
  renderViewerControls(document.getElementById("viewer-controls"));

  loader.hidden = false;

  const {
    scene,
    camera,
    controls,
    renderer,
    composer,
    outlineSelect,
    outlineHover,
    setView,
    setModelBounds,
    rotate,
    toggleAutoRotate,
    requestRender,
  } = createScene(canvas);
  const db = await loadDb();

  // Ayuda, créditos y «Mis datos». Antes de cargar el modelo a propósito: la
  // guía de la primera visita se lee mientras se descargan los .glb. Un
  // disparador del menú lateral lo cierra, para volver al modelo y no al menú.
  initDisparadores({
    antes: (boton) => {
      if (boton.closest("#sidebar")) layout.closeNav();
    },
  });
  initAcerca({ db });
  initDatos();
  initGuia({ db }).abrirSiPrimeraVez();

  const progressByUrl = new Map();
  const labelByUrl = {
    "assets/models/skeletal.glb": "sistema esquelético",
    "assets/models/muscular.glb": "sistema muscular",
    "assets/models/nervous.glb": "sistema nervioso",
    "assets/models/joints.glb": "articulaciones",
  };
  // Son 4 ficheros, no 3: dividir por una constante equivocada hacía que la
  // barra pasara del 100 %. Se promedia sobre los que realmente hay.
  const TOTAL_MODELS = Object.keys(labelByUrl).length;
  const model = await loadModel(scene, db, {
    onProgress: (url, evt) => {
      if (!evt) return;
      const pct = evt.total ? evt.loaded / evt.total : 0;
      progressByUrl.set(url, { pct, total: evt.total, loaded: evt.loaded });
      const entries = [...progressByUrl.entries()];
      const overall = entries.reduce((s, [, v]) => s + v.pct, 0) / TOTAL_MODELS;
      if (loaderBar) loaderBar.style.width = `${Math.round(overall * 100)}%`;
      const active = entries.find(([, v]) => v.pct < 1);
      if (loaderMsg && active) {
        loaderMsg.textContent = `Cargando ${labelByUrl[active[0]] ?? active[0]}…`;
      }
    },
  });
  const layers = createLayers(model.byTipo, db);
  // La librería de BVH se pide en paralelo con los .glb (bvh.js) y a estas
  // alturas ya ha llegado; se espera por si acaso antes de la primera
  // selección (el enlace profundo selecciona durante el arranque), para que
  // el encuadre use siempre el mismo camino. Nunca rechaza, pero un CDN que
  // no responde tampoco la resuelve: sin tope, un jsDelivr colgado dejaba la
  // app entera en la pantalla de carga. Se espera como mucho 3 s; si llega
  // más tarde, precalcularArboles() construye los árboles igual y mientras
  // tanto los rayos van por el camino sin acelerar.
  await Promise.race([bvhListo, new Promise((r) => setTimeout(r, 3000))]);
  // La pasada de profundidad del contorno solo necesita lo que puede tapar la
  // selección (scene.js, OutlinePassRecortado): estas son las mallas que puede
  // omitir.
  outlineSelect.candidatas = model.pickables;
  outlineHover.candidatas = model.pickables;
  initLightbox();

  // Medidas reales del modelo ya escalado: las vistas predefinidas calculan con
  // ellas su distancia en vez de usar una constante pensada para medio cuerpo.
  setModelBounds(measureModel(model));
  setView("reset");

  notice.hidden = true;
  loader.hidden = true;
  requestRender(); // el modelo acaba de entrar en escena

  let pickerRef = null;
  const infoPanel = initInfoPanel(infoPanelEl, {
    db,
    onNavigate: (fichaId) => pickerRef?.selectById(fichaId),
    // Marcar un favorito tiene que verse al momento en la barra lateral: si
    // hay que recargar para que aparezca, el usuario cree que no se guardó.
    onFavorito: () => sidebarApi?.renderFavoritos?.(),
    onComparar: (entry) => compararRef?.empezar(entry),
  });

  const tooltipEl = document.getElementById("hover-tooltip");
  const tooltipEs = document.getElementById("hover-tooltip-es");
  const tooltipLa = document.getElementById("hover-tooltip-la");

  // Tooltip del visor anclado al cursor con Floating UI: se voltea y desplaza
  // solo para no salirse nunca del viewport (antes era un offset fijo).
  function placeTooltip(x, y) {
    const virtualEl = {
      getBoundingClientRect: () => ({
        width: 0, height: 0, x, y, left: x, right: x, top: y, bottom: y,
      }),
    };
    computePosition(virtualEl, tooltipEl, {
      placement: "right-start",
      strategy: "fixed",
      middleware: [offset(14), flip(), shift({ padding: 10 })],
    }).then(({ x: tx, y: ty }) => {
      tooltipEl.style.left = `${tx}px`;
      tooltipEl.style.top = `${ty}px`;
    });
  }

  // Leyenda de inserciones (azul=origen, rojo=inserción) — visible solo cuando
  // el músculo seleccionado tiene huesos de origen/inserción resaltados.
  const attachLegend = document.getElementById("attach-legend");
  function updateAttachLegend(info) {
    if (attachLegend) attachLegend.hidden = !(info && info.highlighted > 0);
  }

  /**
   * Expande una lista de huesos con los que "prestan" geometría.
   *
   * El tintado de origen/inserción compara por `fichaId` de cada malla, así que
   * un músculo que declara `b.ilium` solo teñía el PIN de 24 triángulos: la
   * superficie real pertenece a `b.hip`. Son 31 fichas —todos los glúteos,
   * aductores, isquiotibiales, obturadores…— las que citan ilion, isquion o
   * pubis, o sea casi toda la cadera. El mismo `resalta_tambien` que arregla el
   * contorno arregla aquí el tintado.
   */
  function expandirHuesos(ids) {
    if (!ids?.length) return ids;
    const salida = [...ids];
    for (const id of ids) {
      for (const otra of db.getById(id)?.resalta_tambien ?? []) {
        if (!salida.includes(otra)) salida.push(otra);
      }
    }
    return salida;
  }

  // Lista del contorno por ficha, calculada una vez: las mallas no cambian tras
  // la carga. Antes se filtraban las 2136 pickables en cada llamada, y el hover
  // la llama en cada frame que se mueve el ratón; y como devolvía un array
  // NUEVO cada vez, el visor lo tomaba por un contorno distinto y redibujaba la
  // escena entera aunque siguieras sobre la misma estructura (medido: 14
  // renders completos para 20 movimientos de 1 px dentro de un músculo). Con
  // la misma lista para la misma ficha, la identidad no cambia y no se dibuja.
  const SIN_MALLAS = Object.freeze([]);
  const contornoPorFicha = new Map();
  function meshesForFicha(fichaId) {
    if (!fichaId) return SIN_MALLAS;
    const hecha = contornoPorFicha.get(fichaId);
    if (hecha) return hecha;
    const propias = model.porFicha.get(fichaId) ?? [];
    // Algunas fichas no tienen geometría propia utilizable y toman prestada la
    // de otra. Caso real: en el adulto el coxal está fusionado, así que el
    // modelo trae `Hip bone` como una sola malla y el ilion, el isquion y el
    // pubis solo existen como PINS de landmark de 24 triángulos. Seleccionar
    // "Ilion" enseñaba un punto en vez del ala ilíaca. Con `resalta_tambien`
    // se contornea además el hueso que lo contiene, sin que dos fichas se
    // disputen el mismo `mesh_id` —que el loader no admite: asignaría la malla
    // a la última que la nombre y dejaría a la otra sin resaltado—.
    const prestadas = (db.getById(fichaId)?.resalta_tambien ?? []).flatMap(
      (otra) => model.porFicha.get(otra) ?? [],
    );
    const lista = Object.freeze([...propias, ...prestadas]);
    contornoPorFicha.set(fichaId, lista);
    return lista;
  }

  /**
   * Una estructura con su capa apagada se abría en vacío: ficha abierta, nada
   * en el visor y la cámara quieta (no había mallas visibles que encuadrar).
   * Pasaba al elegirla en la lista, el buscador, J/K o el historial, y en el
   * examen, cuyo ámbito no mira las capas: la pregunta de reconocer mostraba
   * un visor sin nada y la de señalar pedía pinchar algo invisible. Se
   * enciende su capa, con el mismo botón de la barra lateral para que su
   * estado se vea. Devuelve las capas encendidas.
   */
  function asegurarVisible(fichaId) {
    const mallas = model.porFicha.get(fichaId) ?? [];
    if (!mallas.length || mallas.some((m) => m.visible)) return [];
    const encendidas = [];
    for (const capa of new Set(mallas.map((m) => layers.capaDe(m)))) {
      if (layers.isOn(capa)) continue;
      const boton = document.querySelector(`button[data-layer="${capa}"]`);
      if (boton) boton.click();
      else layers.toggle(capa);
      encendidas.push(capa);
    }
    return encendidas;
  }

  // Estructura B de una comparación abierta: ocupa el contorno de hover (en
  // ámbar). Mientras exista, pasar el ratón no puede tocar ese contorno; antes
  // lo hacía, y al salir del canvas el contorno de B desaparecía.
  let cmpB = null;

  function setHoverOutline(fichaId) {
    if (cmpB) return;
    // Outline every mesh belonging to the ficha. Z-Anatomy splits each muscle
    // into 2 primitives (front/back shells), so outlining only one would leave
    // the contour incomplete — we want the full muscle silhouette.
    outlineHover.selectedObjects = meshesForFicha(fichaId);
  }
  function setSelectOutline(fichaId) {
    outlineSelect.selectedObjects = meshesForFicha(fichaId);
  }

  let sidebarApi = null;
  let restoring = false;
  let currentId = null;
  let quizShowing = false;

  /**
   * Aislar la estructura seleccionada: oculta todo lo demás.
   *
   * Sirve para dos cosas a la vez. Estudiando, deja ver una estructura sin las
   * otras dos mil tapándola o confundiéndola con sus vecinas. Y de paso es la
   * palanca de rendimiento más efectiva que hay: el contorno redibuja la escena
   * entera para su máscara, así que su coste va con cuántas mallas están
   * VISIBLES, no con cuántas están seleccionadas — medido, pasar de 2042 mallas
   * a 1170 recorta el frame casi a la mitad.
   *
   * Se conservan visibles los huesos de origen e inserción: una estructura
   * flotando sin sus anclajes no se entiende. Con `expandirHuesos` y el
   * `resalta_tambien` de la propia ficha, igual que el tintado y el contorno:
   * sin ellos, aislar un glúteo dejaba el PIN de 24 triángulos del ilion en
   * vez del coxal, y aislar "Ilion" dejaba solo ese punto.
   *
   * El aislamiento es un filtro de layers.js, no una foto de `visible`: así las
   * capas se pueden seguir tocando con Aislar activo sin romper ninguna de las
   * dos cosas. Se declara aquí arriba porque onSelect lo consulta y el enlace
   * profundo selecciona antes de que el resto de boot() haya corrido.
   */
  let aislado = null; // Set de fichaId visibles mientras se aísla, o null
  const announce = (msg) => {
    const live = document.getElementById("ficha-live");
    if (live) live.textContent = msg;
  };
  function conjuntoAislado(id) {
    const entry = db.getById(id);
    return new Set([
      id,
      ...(entry?.resalta_tambien ?? []),
      ...(expandirHuesos(entry?.origen_huesos) ?? []),
      ...(expandirHuesos(entry?.insercion_huesos) ?? []),
    ]);
  }
  function aislar(id) {
    aislado = conjuntoAislado(id);
    layers.setFiltro(aislado);
    document.getElementById("btn-isolate")?.classList.add("is-active");
    announce(`Aislado: ${db.getById(id)?.nombre_es ?? id} con sus inserciones`);
  }
  function desaislar({ anunciar = true } = {}) {
    if (!aislado) return;
    aislado = null;
    layers.setFiltro(null);
    document.getElementById("btn-isolate")?.classList.remove("is-active");
    if (anunciar) announce("Aislamiento desactivado");
  }
  function alternarAislar() {
    if (aislado) {
      desaislar();
      return;
    }
    if (!currentId) {
      announce("Selecciona una estructura para aislarla");
      return;
    }
    aislar(currentId);
  }

  function clearSelection() {
    // Esc/doble clic lo limpian todo: también una comparación abierta (antes
    // quedaba el panel con A y B y solo el contorno de B) y el aislamiento
    // (antes seguía activo sin nada seleccionado, con el botón encendido).
    if (compararRef?.activo?.()) compararRef.cerrar();
    desaislar({ anunciar: false });
    clearFocus(model);
    updateAttachLegend(null);
    setBreadcrumb(null);
    setSelectOutline(null);
    setHoverOutline(null);
    infoPanel.render(null);
    sidebarApi?.setActive(null);
    currentId = null;
    writeHash(null);
    setView("reset");
  }

  // El picker se crea antes que el quiz y necesita consultarlo: se resuelve
  // con una referencia que se rellena más abajo, no adelantando la creación.
  let quizRef = null;
  let compararRef = null;
  let textoHoverDe = null; // ficha cuyo nombre está escrito en la etiqueta de hover

  const picker = createPicker({
    canvas,
    camera,
    root: model.root,
    pickables: model.pickables,
    porFicha: model.porFicha,
    onHover: (id, mesh, pos) => {
      if (quizShowing) return; // la etiqueta del cursor delataría el nombre
      if (!id) {
        hoverLabel.classList.remove("visible");
        tooltipEl.hidden = true;
        setHoverOutline(null);
        return;
      }
      const entry = db.getById(id);
      if (!entry) return;
      // El texto solo se reescribe si cambia la estructura: reasignar
      // `textContent` con el mismo valor sustituye el nodo igualmente e
      // invalida el layout en cada frame de ratón.
      if (textoHoverDe !== id) {
        textoHoverDe = id;
        hoverLabel.textContent = `${entry.nombre_es} · ${entry.nombre_la}`;
        tooltipEs.textContent = entry.nombre_es;
        tooltipLa.textContent = entry.nombre_la;
      }
      hoverLabel.classList.add("visible");
      tooltipEl.hidden = false;
      if (pos) placeTooltip(pos.x, pos.y);

      setHoverOutline(id);
    },
    onSelect: (id, mesh, { clicada = false } = {}) => {
      // Si se está eligiendo la segunda estructura a comparar, el clic es eso
      // y no una selección normal: abrir la ficha cerraría la comparación.
      if (compararRef?.esperandoSegunda?.() && compararRef.fijarSegunda(id)) return;
      // En el examen "señalar en el modelo", el clic ES la respuesta. Solo el
      // clic: J/K, la lista y el buscador también llegan aquí (selectById) y
      // daban la pregunta por respondida con lo que eligieran ("has señalado
      // Buccinador" al pulsar J). Durante el examen se ignoran, como ya se
      // ignoraban en "reconocer".
      if (quizRef?.estaSenalando?.()) {
        if (clicada) quizRef.responderMalla(id);
        return;
      }
      // En el examen "reconocer", pinchar una malla revelaría la respuesta.
      if (quizShowing) return;
      // Con una comparación A/B ya fijada, elegir otra estructura es salir de
      // ella: antes el panel seguía mostrando A y B mientras el contorno y la
      // ficha pasaban a la nueva.
      if (compararRef?.activo?.() && !compararRef.esperandoSegunda?.()) compararRef.cerrar();
      const entry = db.getById(id);
      if (!entry) return;
      currentId = id;
      // Con Aislar activo, una estructura que queda FUERA de lo aislado (J/K,
      // lista, buscador) se abría invisible: la cámara no tenía nada que
      // encuadrar. El aislamiento pasa a la nueva. Si ya está a la vista
      // dentro de lo aislado (clic en uno de sus huesos), se respeta la vista.
      if (aislado && !aislado.has(id)) aislar(id);
      // Y si su capa está apagada, se enciende (decisión del loop nocturno: no
      // abrir nunca una ficha en vacío). Se anuncia, porque cambia las capas.
      const capasEncendidas = asegurarVisible(id);
      infoPanel.render(entry);
      setBreadcrumb(entry);
      sidebarApi?.setActive(id);
      const focusInfo = applyFocus(model, id, {
        origen_huesos: expandirHuesos(entry.origen_huesos),
        insercion_huesos: expandirHuesos(entry.insercion_huesos),
      });
      updateAttachLegend(focusInfo);
      focusCameraOnFicha(model, id, camera, controls);
      setSelectOutline(id);
      layout.openInfo();
      // La URL refleja la estructura abierta: el enlace se puede compartir y
      // los botones Atrás/Adelante recorren lo visitado.
      if (!restoring) writeHash(id);
      sidebarApi?.renderRecent(remember(entry));
      if (capasEncendidas.length) {
        const nombres = capasEncendidas.map((c) => LAYERS.find((l) => l.id === c)?.label ?? c);
        announce(`Capa ${nombres.join(" y ")} encendida para mostrar ${entry.nombre_es}`);
      }
    },
  });
  pickerRef = picker;

  canvas.addEventListener("dblclick", clearSelection);

  // Anillo de feedback en el punto de clic (Motion One). Un arrastre de
  // OrbitControls termina en `click` sobre el canvas, así que sin comparar la
  // posición de pointerdown cada rotación dejaba un anillo; y un doble clic,
  // que emite dos clicks previos, dejaba dos.
  let pointerDownAt = null;
  canvas.addEventListener("pointerdown", (e) => {
    pointerDownAt = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("click", (e) => {
    if (e.detail > 1) return;
    if (!pointerDownAt) return;
    const moved = Math.hypot(e.clientX - pointerDownAt.x, e.clientY - pointerDownAt.y);
    if (moved > 4) return;
    const rect = canvas.getBoundingClientRect();
    ripple(canvas.parentElement, e.clientX - rect.left, e.clientY - rect.top);
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    // Dentro de un diálogo (guía, «Acerca de», «Mis datos», imagen ampliada)
    // las teclas son suyas: las flechas desplazan su texto en vez de girar el
    // modelo de detrás, y J/K o Espacio no cambian nada que no se ve. Escape lo
    // gestiona Shoelace, y nunca debía limpiar la selección con uno abierto.
    if (t.closest?.("sl-dialog")) return;
    // No basta con excluir campos de texto: si el foco está en cualquier
    // control (botón, pestaña, acordeón), el preventDefault de Espacio impedía
    // que el navegador emitiera el `click` del keyup, y la aplicación entera
    // solo se podía activar con Enter. Las flechas hacían lo propio con la
    // navegación de pestañas y el desplazamiento de los paneles.
    const isEditable =
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t.isContentEditable ||
      t.closest?.("button, [role='button'], a[href], summary, sl-tab, sl-details, sl-input") != null;

    // Nunca pisar los atajos del sistema o del navegador.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "Escape") {
      if (isEditable) return;
      // Un overlay abierto se cierra solo con Escape: si además limpiáramos la
      // selección, cerrar una imagen ampliada destruiría la ficha y la cámara.
      if (document.querySelector("sl-dialog[open], sl-drawer[open]")) return;
      clearSelection();
    } else if ((e.key === "j" || e.key === "J") && !isEditable) {
      e.preventDefault();
      irA(1);
    } else if ((e.key === "k" || e.key === "K") && !isEditable) {
      e.preventDefault();
      irA(-1);
    } else if ((e.key === "a" || e.key === "A") && !isEditable) {
      e.preventDefault();
      alternarAislar();
    } else if (e.key === "/" && !isEditable) {
      e.preventDefault();
      document.getElementById("search-input")?.focus();
    } else if (e.key === "1" && !isEditable) {
      setView("front");
    } else if (e.key === "2" && !isEditable) {
      setView("lateral");
    } else if (e.key === "3" && !isEditable) {
      setView("back");
    } else if (e.key === "ArrowLeft" && !isEditable) {
      e.preventDefault();
      rotate(-0.08, 0);
    } else if (e.key === "ArrowRight" && !isEditable) {
      e.preventDefault();
      rotate(0.08, 0);
    } else if (e.key === "ArrowUp" && !isEditable) {
      e.preventDefault();
      rotate(0, -0.08);
    } else if (e.key === "ArrowDown" && !isEditable) {
      e.preventDefault();
      rotate(0, 0.08);
    } else if ((e.key === " " || e.code === "Space") && !isEditable) {
      e.preventDefault();
      const on = toggleAutoRotate();
      document.getElementById("btn-autorotate")?.classList.toggle("is-active", on);
    } else if (e.key === "b" && !isEditable) {
      document.querySelector('button[data-layer="bone"]')?.click();
    } else if (e.key === "m" && !isEditable) {
      // Toggle both muscle sub-layers together
      document.querySelector('button[data-layer="muscle-superficial"]')?.click();
      document.querySelector('button[data-layer="muscle-deep"]')?.click();
    } else if (e.key === "p" && !isEditable) {
      // 'p' = toggle only superficial, revealing deep muscles
      document.querySelector('button[data-layer="muscle-superficial"]')?.click();
    } else if (e.key === "n" && !isEditable) {
      document.querySelector('button[data-layer="nerve"]')?.click();
    } else if (e.key === "l" && !isEditable) {
      document.querySelector('button[data-layer="ligament"]')?.click();
    }
  });

  /**
   * Navegación secuencial por teclado (J/K, o ↑/↓ con el visor enfocado).
   * Recorre las estructuras en el mismo orden que la barra lateral, así que
   * repasar una región entera no exige ir pinchando ficha por ficha. Es
   * también lo que hace utilizable el visor sin ratón.
   */
  function irA(paso) {
    const orden = sidebarApi?.ordenNavegacion?.() ?? [];
    if (!orden.length) return;
    const i = currentId ? orden.indexOf(currentId) : -1;
    // Sin selección previa se entra por el principio (o por el final si se
    // navega hacia atrás), en vez de no hacer nada.
    const siguiente =
      i === -1 ? (paso > 0 ? 0 : orden.length - 1) : (i + paso + orden.length) % orden.length;
    picker.selectById(orden[siguiente]);
  }

  sidebarApi = initSidebar({
    layers,
    db,
    // Abrir una región solo despliega su lista: no se selecciona nada.
    onRegion: () => {},
    onEntry: (id) => {
      picker.selectById(id);
      layout.closeNav();
    },
  });

  initSearch({
    db,
    onSelect: (entry) => picker.selectById(entry.id),
  });

  // Tras importar «Mis datos», lo que está a la vista se repinta sin recargar
  // (recargar volvería a descargar el modelo): favoritos, recientes y la ficha
  // abierta, con su estrella y su anotación.
  window.addEventListener("fisio:datos-cambiados", () => {
    sidebarApi?.renderFavoritos?.();
    sidebarApi?.renderRecent?.();
    if (currentId && !quizShowing) infoPanel.render(db.getById(currentId), { silencioso: true });
  });

  // ---- Modo examen ------------------------------------------------------
  // Señala la estructura en 3D sin escribir su nombre en ningún sitio: por eso
  // durante el examen se ocultan la ficha, el breadcrumb y la etiqueta flotante
  // del visor, que la delatarían.
  const quiz = initQuiz({
    db,
    onEnter: () => {
      layout.closeNav();
      // Una comparación a medias se comería el primer clic del examen: el
      // picker consulta al comparador antes que al quiz.
      compararRef?.cerrar();
      // Con Aislar activo casi todas las preguntas caían sobre estructuras
      // ocultas: ni reconocibles ni señalables.
      desaislar({ anunciar: false });
    },
    onShow: (entry, opts = {}) => {
      quizShowing = true;
      infoPanel.render(null);
      setBreadcrumb(null);
      asegurarVisible(entry.id);
      applyFocus(model, entry.id, {});
      // Al señalar hay que forzar el encuadre: sin `force`, la cámara se queda
      // donde estaba si la estructura "ya se ve", y un hueso del carpo en una
      // vista de cuerpo entero es indistinguible. Con holgura amplia se ve la
      // región y sus vecinos, que es donde está la dificultad real; centrarla
      // sola sería regalar la respuesta. Y no se contornea, claro.
      focusCameraOnFicha(
        model,
        entry.id,
        camera,
        controls,
        opts.senalar ? { force: true, holgura: 4.5, distanciaMin: 0.9, distanciaMax: 3.4 } : {},
      );
      setSelectOutline(opts.senalar ? null : entry.id);
      sidebarApi?.setActive(null);
      writeHash(null);
    },
    onReveal: (entry, opts = {}) => {
      // Ya se ha respondido: se puede mostrar de dónde a dónde va.
      const info = applyFocus(model, entry.id, {
        origen_huesos: expandirHuesos(entry.origen_huesos),
        insercion_huesos: expandirHuesos(entry.insercion_huesos),
      });
      updateAttachLegend(info);
      // En "señalar" el contorno se guardaba para este momento: es la
      // corrección, y sin él no se aprende dónde estaba.
      if (opts.senalar) setSelectOutline(entry.id);
    },
    onExit: () => {
      quizShowing = false;
      clearSelection();
    },
  });

  quizRef = quiz;

  // Comparador. El segundo contorno (el que normalmente marca el hover) se
  // reutiliza para la estructura B, con otro color: dos azules casi iguales
  // no dirían cuál es cuál.
  const comparar = initComparar({
    db,
    contenedor: document.getElementById("cmp-panel"),
    onResaltar: (idA, idB) => {
      setSelectOutline(idA);
      if (idB) {
        // B tiene que verse para compararla: con Aislar activo estaba oculta.
        desaislar({ anunciar: false });
        cmpB = idB;
        outlineHover.visibleEdgeColor.set("#ffb74d");
        outlineHover.hiddenEdgeColor.set("#6b4a18");
        outlineHover.selectedObjects = meshesForFicha(idB);
        // Encuadre de las DOS: con la cámara puesta en una sola, la otra queda
        // fuera de pantalla y la comparación visual no existe.
        focusCameraOnFicha(model, [idA, idB], camera, controls, {
          force: true,
          holgura: 3.2,
        });
      } else {
        cmpB = null;
        outlineHover.selectedObjects = SIN_MALLAS;
        outlineHover.visibleEdgeColor.set("#9ee3ff");
        outlineHover.hiddenEdgeColor.set("#0e2a3a");
      }
      requestRender(); // los colores del contorno no cambian su identidad
    },
    onCerrar: () => {
      // El hover vuelve a ser hover: sin restaurar el color, la etiqueta del
      // cursor se quedaría ámbar para siempre.
      cmpB = null;
      outlineHover.visibleEdgeColor.set("#9ee3ff");
      outlineHover.hiddenEdgeColor.set("#0e2a3a");
      if (currentId) setSelectOutline(currentId);
      requestRender();
    },
  });
  compararRef = comparar;

  // Atrás/Adelante del navegador: `restoring` evita que la selección vuelva a
  // escribir en el historial y se genere un bucle.
  onNavigate((id) => {
    if (id === currentId) return;
    restoring = true;
    if (id && db.getById(id)) picker.selectById(id);
    else clearSelection();
    restoring = false;
  });

  // Enlace profundo al abrir: se restaura sin dejar un paso "atrás" vacío.
  const initialId = idFromHash();
  if (initialId && db.getById(initialId)) {
    restoring = true;
    picker.selectById(initialId);
    restoring = false;
    writeHash(initialId, { replace: true });
  }

  document.querySelectorAll(".viewer__controls button").forEach((btn) => {
    btn.addEventListener("click", () => {
      press(btn);
      const action = btn.dataset.action;
      if (action === "reset-camera") setView("reset");
      else if (action === "view-front") setView("front");
      else if (action === "view-back") setView("back");
      else if (action === "view-lateral") setView("lateral");
      else if (action === "view-medial") setView("medial");
      else if (action === "view-superior") setView("superior");
      else if (action === "view-inferior") setView("inferior");
      else if (action === "frame") {
        if (currentId) focusCameraOnFicha(model, currentId, camera, controls, { force: true });
      } else if (action === "isolate") {
        alternarAislar();
      } else if (action === "help") {
        hintEl.hidden = !hintEl.hidden;
      } else if (action === "autorotate") {
        const on = toggleAutoRotate();
        btn.classList.toggle("is-active", on);
      }
    });
  });

  window.addEventListener("autorotate:changed", (e) => {
    document.getElementById("btn-autorotate")?.classList.toggle("is-active", e.detail);
  });

  // La pista de controles ya no aparece sola al abrir: saturaba la pantalla
  // desde el primer segundo. Vive detrás del botón "?" de la barra de vistas.
  const hintEl = document.getElementById("viewer-hint");
  document.getElementById("viewer-hint-close")?.addEventListener("click", () => {
    hintEl.hidden = true;
  });

  // Expuesto para depurar desde la consola (contadores de render incluidos).
  window.__fisioAtlas = { db, model, layers, picker, layout, quiz, renderer, composer, scene, camera, controls, setView, focusCameraOnFicha, outlineSelect, outlineHover, requestRender };

  // Árboles de rayos (bvh.js): se terminan de construir en los ratos libres.
  // Estado en la consola:  window.__fisioAtlas.bvh()
  precalcularArboles(model.pickables);
  window.__fisioAtlas.bvh = () => ({ ...bvhStats, ms: Math.round(bvhStats.ms), msMax: Math.round(bvhStats.msMax) });
  window.__fisioAtlas.usarBVH = usarBVH;

  // `renderer.info` es la única medida fiable de lo que hay vivo en la GPU: el
  // heap de JS depende de cuándo pase el recolector y no sirve para comparar
  // dos ejecuciones. Con esto se audita si cambiar de capa deja geometrías sin
  // liberar —  window.__fisioAtlas.gpu()  — y se comparan versiones de three.
  window.__fisioAtlas.gpu = () => ({
    geometrias: renderer.info.memory.geometries,
    texturas: renderer.info.memory.textures,
    programas: renderer.info.programs?.length ?? 0,
    revision: THREE.REVISION,
  });
}

/** Caja envolvente de las mallas catalogadas, en unidades de escena. */
function measureModel(model) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  model.root.updateMatrixWorld(true);
  for (const m of model.pickables) {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) continue;
    tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    box.union(tmp);
  }
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}

boot().catch((err) => {
  window.__bootError = err;
  console.error(err);
  const loader = document.getElementById("viewer-loader");
  if (loader) {
    loader.hidden = false;
    // Lo lee la estudiante, no quien programa: qué ha pasado y qué puede hacer.
    // El detalle técnico queda plegado para quien le ayude a resolverlo.
    loader.innerHTML = `
      <div class="viewer__error" role="alert">
        <h2>No se pudo abrir el atlas</h2>
        <p>Comprueba tu conexión a internet y vuelve a abrir la página.</p>
        <button type="button" class="btn btn--primario">Reintentar</button>
        <details><summary>Detalles para quien te ayude</summary><code></code></details>
      </div>`;
    loader.querySelector(".viewer__error button")?.addEventListener("click", () => location.reload());
    const detalle = loader.querySelector(".viewer__error code");
    if (detalle) detalle.textContent = String(err?.message ?? err);
  }
});
