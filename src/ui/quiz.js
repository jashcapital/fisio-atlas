/**
 * Modo examen: el visor señala una estructura y hay que reconocerla.
 *
 * Convierte el atlas en algo con lo que se estudia, no solo se consulta. La
 * dificultad está en los distractores: se eligen del MISMO tipo y, si se puede,
 * de la misma región, porque distinguir el glúteo medio del menor es el examen
 * de verdad — separarlo de un hueso del carpo no enseña nada.
 */
import { REGION_LABELS, TIPO_LABELS } from "./sidebar.js";
import { revisar, vencidas, nuevas, estadisticas } from "./srs.js";

const N_OPCIONES = 4;
const KEY_RECORD = "fisio-atlas:examen-record";

export function initQuiz({ db, onEnter, onShow, onReveal, onExit }) {
  const panel = document.getElementById("quiz-panel");
  const btnStart = document.getElementById("btn-quiz");
  if (!panel || !btnStart) return { isActive: () => false };

  let activo = false;
  let actual = null;
  let opciones = [];
  let respondida = false;
  let aciertos = 0;
  let total = 0;
  let ambito = { tipo: "all", region: "all" };
  // "repaso" usa repetición espaciada; "azar" es el modo aleatorio original.
  let modo = "repaso";
  // "reconocer": el visor señala y se elige el nombre (lo de siempre).
  // "senalar": se da el nombre y hay que encontrarla en el modelo. Es la otra
  // mitad del estudio anatómico — reconocer un nombre en una lista es mucho
  // más fácil que localizar la estructura, que es lo que piden un examen
  // práctico y la camilla.
  let formato = "reconocer";

  /** Candidatas según el ámbito elegido, y solo las que tienen malla real. */
  function candidatas() {
    return db.all().filter((e) => {
      if (ambito.tipo !== "all" && e.tipo !== ambito.tipo) return false;
      if (ambito.region !== "all" && e.region !== ambito.region) return false;
      return true;
    });
  }

  function elegirPregunta() {
    const pool = candidatas();
    if (pool.length < 2) return null;

    let objetivo;
    if (modo === "repaso") {
      // Prioridad: lo que toca repasar hoy; si no hay nada vencido, algo que
      // no se haya preguntado nunca; y si ya se ha visto todo, al azar.
      const ids = pool.map((e) => e.id);
      const debe = vencidas(ids);
      const sinVer = debe.length ? [] : nuevas(ids);
      const candidata = debe[0] ?? (sinVer.length ? sinVer[Math.floor(Math.random() * sinVer.length)] : null);
      objetivo = candidata ? pool.find((e) => e.id === candidata) : null;
    }
    if (!objetivo) objetivo = pool[Math.floor(Math.random() * pool.length)];

    // Distractores: primero del mismo tipo y región; si no llegan, mismo tipo;
    // y como último recurso, cualquiera. Así la pregunta sigue siendo difícil
    // aunque la región tenga pocas estructuras.
    const mismoTipoRegion = pool.filter(
      (e) => e.id !== objetivo.id && e.tipo === objetivo.tipo && e.region === objetivo.region,
    );
    const mismoTipo = db
      .all()
      .filter((e) => e.id !== objetivo.id && e.tipo === objetivo.tipo);
    const resto = db.all().filter((e) => e.id !== objetivo.id);

    const distractores = [];
    for (const fuente of [mismoTipoRegion, mismoTipo, resto]) {
      for (const e of barajar(fuente)) {
        if (distractores.length >= N_OPCIONES - 1) break;
        if (!distractores.some((d) => d.id === e.id)) distractores.push(e);
      }
      if (distractores.length >= N_OPCIONES - 1) break;
    }
    return { objetivo, opciones: barajar([objetivo, ...distractores]) };
  }

  function siguiente() {
    const q = elegirPregunta();
    if (!q) {
      panel.querySelector(".quiz__body").innerHTML =
        `<p class="quiz__empty">No hay bastantes estructuras con ese filtro.</p>`;
      return;
    }
    actual = q.objetivo;
    opciones = q.opciones;
    respondida = false;
    onShow?.(actual, { senalar: formato === "senalar" });
    render();
  }

  function responder(id, boton) {
    if (respondida) return;
    respondida = true;
    total++;
    const acertado = id === actual.id;
    if (acertado) aciertos++;

    panel.querySelectorAll(".quiz__opt").forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === actual.id) b.classList.add("is-correct");
      else if (b === boton) b.classList.add("is-wrong");
    });
    if (modo === "repaso") revisar(actual.id, acertado);
    panel.querySelector(".quiz__marcador").textContent = marcador();
    panel.querySelector(".quiz__feedback").innerHTML = acertado
      ? `<strong class="ok">Correcto</strong> · <em lang="la">${escapeHtml(actual.nombre_la)}</em>`
      : `<strong class="ko">Era ${escapeHtml(actual.nombre_es)}</strong> · <em lang="la">${escapeHtml(actual.nombre_la)}</em>`;
    panel.querySelector(".quiz__next").hidden = false;
    panel.querySelector(".quiz__next").focus();
    guardarRecord();
    onReveal?.(actual);
  }

  /**
   * Respuesta del modo "señalar": llega el id de la malla pinchada en el
   * visor. Lo llama main.js, que es quien tiene el picker.
   */
  function responderMalla(id) {
    if (respondida || formato !== "senalar" || !actual) return;
    respondida = true;
    total++;
    const acertado = id === actual.id;
    if (acertado) aciertos++;
    if (modo === "repaso") revisar(actual.id, acertado);

    const elegida = db.getById(id);
    panel.querySelector(".quiz__marcador").textContent = marcador();
    panel.querySelector(".quiz__feedback").innerHTML = acertado
      ? `<strong class="ok">Correcto</strong> · <em lang="la">${escapeHtml(actual.nombre_la)}</em>`
      : `<strong class="ko">No</strong> · has señalado ${escapeHtml(elegida?.nombre_es ?? "otra estructura")}; se resalta la correcta.`;
    const next = panel.querySelector(".quiz__next");
    next.hidden = false;
    next.focus();
    guardarRecord();
    onReveal?.(actual, { senalar: true, acertado });
  }

  function marcador() {
    const pct = total ? Math.round((aciertos / total) * 100) : 0;
    return `${aciertos}/${total} · ${pct}%`;
  }

  /** Mejor porcentaje conseguido, solo a partir de 5 respuestas: con 1 de 1
   *  cualquiera tiene un 100 % y el récord deja de significar nada. */
  function guardarRecord() {
    if (total < 5) return;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY_RECORD) || "{}");
      const pct = Math.round((aciertos / total) * 100);
      localStorage.setItem(
        KEY_RECORD,
        JSON.stringify({ mejor: Math.max(prev.mejor || 0, pct), respondidas: (prev.respondidas || 0) + 1 }),
      );
    } catch {
      /* el récord es accesorio: nunca debe impedir examinarse */
    }
  }

  function render() {
    const regiones = [...new Set(db.all().map((e) => e.region))];
    panel.innerHTML = `
      <header class="quiz__header">
        <span class="quiz__title">Modo examen</span>
        <span class="quiz__marcador">${marcador()}</span>
        <button type="button" class="quiz__close" aria-label="Salir del modo examen">×</button>
      </header>
      <div class="quiz__filtros">
        <label class="sr-only" for="quiz-formato">Formato</label>
        <select id="quiz-formato" class="quiz__select">
          <option value="reconocer" ${formato === "reconocer" ? "selected" : ""}>Reconocer el nombre</option>
          <option value="senalar" ${formato === "senalar" ? "selected" : ""}>Señalar en el modelo</option>
        </select>
        <label class="sr-only" for="quiz-modo">Modo</label>
        <select id="quiz-modo" class="quiz__select">
          <option value="repaso" ${modo === "repaso" ? "selected" : ""}>Repaso espaciado</option>
          <option value="azar" ${modo === "azar" ? "selected" : ""}>Aleatorio</option>
        </select>
        <label class="sr-only" for="quiz-tipo">Tipo</label>
        <select id="quiz-tipo" class="quiz__select">
          <option value="all">Todos los tipos</option>
          ${["muscle", "bone", "nerve", "ligament"]
            .map(
              (t) =>
                `<option value="${t}" ${ambito.tipo === t ? "selected" : ""}>${TIPO_LABELS[t]}</option>`,
            )
            .join("")}
        </select>
        <label class="sr-only" for="quiz-region">Región</label>
        <select id="quiz-region" class="quiz__select">
          <option value="all">Todas las regiones</option>
          ${regiones
            .map(
              (r) =>
                `<option value="${escapeAttr(r)}" ${ambito.region === r ? "selected" : ""}>${escapeHtml(REGION_LABELS[r] ?? r)}</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="quiz__body">
        ${modo === "repaso" ? renderEstado() : ""}
        ${formato === "senalar" ? renderSenalar() : renderReconocer()}
        <p class="quiz__feedback" aria-live="polite"></p>
        <button type="button" class="quiz__next" hidden>Siguiente →</button>
      </div>`;

    panel.querySelectorAll(".quiz__opt").forEach((b) => {
      b.addEventListener("click", () => responder(b.dataset.id, b));
    });
    panel.querySelector(".quiz__next").addEventListener("click", siguiente);
    panel.querySelector(".quiz__close").addEventListener("click", salir);
    panel.querySelector("#quiz-formato").addEventListener("change", (e) => {
      formato = e.target.value;
      siguiente();
    });
    panel.querySelector("#quiz-modo").addEventListener("change", (e) => {
      modo = e.target.value;
      siguiente();
    });
    panel.querySelector("#quiz-tipo").addEventListener("change", (e) => {
      ambito.tipo = e.target.value;
      siguiente();
    });
    panel.querySelector("#quiz-region").addEventListener("change", (e) => {
      ambito.region = e.target.value;
      siguiente();
    });
  }

  function renderReconocer() {
    return `
      <p class="quiz__pregunta">¿Qué estructura está señalada?</p>
      <div class="quiz__opts" role="group" aria-label="Opciones">
        ${opciones
          .map(
            (o, i) => `
          <button type="button" class="quiz__opt" data-id="${escapeAttr(o.id)}">
            <kbd>${i + 1}</kbd><span>${escapeHtml(o.nombre_es)}</span>
          </button>`,
          )
          .join("")}
      </div>`;
  }

  function renderSenalar() {
    return `
      <p class="quiz__pregunta">Señala en el modelo:</p>
      <p class="quiz__diana">
        <strong>${escapeHtml(actual.nombre_es)}</strong>
        <em lang="la">${escapeHtml(actual.nombre_la)}</em>
      </p>
      <p class="quiz__ayuda">La cámara ya está en la zona. Toca la estructura en el modelo.</p>`;
  }

  /** Qué toca hoy y cuánto llevas asentado, con el filtro actual aplicado. */
  function renderEstado() {
    const ids = candidatas().map((e) => e.id);
    const st = estadisticas(ids);
    const partes = [];
    if (st.pendientes) partes.push(`<b>${st.pendientes}</b> para repasar hoy`);
    if (st.sinVer) partes.push(`${st.sinVer} sin ver`);
    if (st.consolidadas) partes.push(`${st.consolidadas} asentadas`);
    if (!partes.length) return `<p class="quiz__estado">Nada pendiente por hoy. Sigue practicando si quieres.</p>`;
    return `<p class="quiz__estado">${partes.join(" · ")}</p>`;
  }

  function entrar() {
    activo = true;
    aciertos = 0;
    total = 0;
    // En compacto el examen se activa desde el drawer: si se queda abierto
    // tapa el panel y el modelo, que es justo lo que hay que mirar.
    onEnter?.();
    panel.hidden = false;
    document.documentElement.dataset.quiz = "on";
    btnStart.setAttribute("aria-pressed", "true");
    siguiente();
  }

  function salir() {
    activo = false;
    panel.hidden = true;
    delete document.documentElement.dataset.quiz;
    btnStart.setAttribute("aria-pressed", "false");
    onExit?.();
  }

  btnStart.addEventListener("click", () => (activo ? salir() : entrar()));

  // Teclas 1-4 para responder y Enter para pasar: examinarse con el ratón es lento.
  document.addEventListener("keydown", (e) => {
    if (!activo) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    // Con la guía u otro diálogo abierto encima, 1-4 o Escape son para él: no
    // pueden responder la pregunta de detrás ni salir del examen.
    if (document.querySelector("sl-dialog[open]")) return;
    if (e.key === "Escape") {
      salir();
      return;
    }
    const n = Number(e.key);
    if (formato === "reconocer" && n >= 1 && n <= N_OPCIONES && !respondida) {
      const btn = panel.querySelectorAll(".quiz__opt")[n - 1];
      if (btn) {
        e.preventDefault();
        responder(btn.dataset.id, btn);
      }
    } else if (e.key === "Enter" && respondida) {
      e.preventDefault();
      siguiente();
    }
  });

  return {
    isActive: () => activo,
    /** true cuando toca pinchar en el visor en vez de elegir un botón. */
    estaSenalando: () => activo && formato === "senalar" && !respondida,
    responderMalla,
    salir,
  };
}

function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

// Clave de almacenamiento, para exportar e importar «Mis datos» (datos.js).
export { KEY_RECORD as CLAVE_RECORD };
