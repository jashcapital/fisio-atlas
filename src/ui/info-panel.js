import { renderGallery } from "./gallery.js";
import { REGION_LABELS, TIPO_LABELS, regionParent } from "./sidebar.js";
import { enterFicha, enterTabPanel } from "./motion.js";
import { esFavorito, alternarFavorito, obtener, guardarNota } from "./notas.js";
import { SELLOS, fraseRecuento } from "./sellos.js";

const TABS = [
  { id: "info", label: "Información" },
  { id: "fisio", label: "Fisioterapia" },
  { id: "action", label: "Acción" },
  { id: "images", label: "Imágenes" },
];

let current = null;
let activeTab = "info";
let panelDb = null;
let onNavigate = null;

let avisarFavorito = null;
let avisarComparar = null;

export function initInfoPanel(el, { db, onNavigate: navHandler, onFavorito, onComparar } = {}) {
  avisarFavorito = onFavorito;
  avisarComparar = onComparar;
  panelDb = db;
  onNavigate = navHandler;
  /**
   * `silencioso`: repinta sin mover el foco ni anunciar la ficha. Lo usa main.js
   * al importar «Mis datos» con la ficha abierta detrás del diálogo: robarle el
   * foco al diálogo para enseñar una estrella que ni se ve sería un estorbo.
   */
  function render(entry, { silencioso = false } = {}) {
    if (!entry) {
      current = null;
      // El recuento sale de los datos: fijo en el HTML, se quedaría viejo con
      // cada lote de verificación.
      el.innerHTML = `
        <div class="info-panel__empty">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".6" fill="currentColor"/></svg>
          <h2>Selecciona una estructura</h2>
          <p>Toca cualquier músculo, hueso, nervio o ligamento del modelo, o búscalo arriba, para ver su ficha.</p>
          <p class="info-panel__recuento">${panelDb ? `${fraseRecuento(panelDb)}.` : ""}</p>
          <button type="button" class="link info-panel__sellos" data-abrir="acerca" data-seccion="sellos">¿Qué significan los sellos?</button>
        </div>`;
      return;
    }

    current = entry;
    el.innerHTML = renderFicha(entry, activeTab);
    el.scrollTop = 0;
    wireTabs(el);
    wireGallery(el, entry);
    wireLinks(el);
    wireNotas(el, entry);
    wireSello(el);
    enterFicha(el.querySelector(".ficha"));
    if (silencioso) return;

    // La ficha se reconstruye con innerHTML: sin esto, un lector de pantalla no
    // anuncia nada al seleccionar, y al navegar por un chip de hueso el botón
    // que tenía el foco se destruye y el foco cae al <body>.
    const live = document.getElementById("ficha-live");
    if (live) live.textContent = `Ficha: ${entry.nombre_es}, ${entry.nombre_la}.`;
    const title = el.querySelector(".ficha__title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    }
  }

  render(null);
  return { render };
}

/**
 * El sello se toca para leer qué significa. Un `sl-tooltip` no se abre con un
 * toque, y en una tablet esa explicación es justo lo que hace que «Sin
 * verificar» informe en vez de alarmar: así es un botón que despliega una
 * nota debajo, que sirve igual con el dedo, el teclado o un lector de pantalla.
 */
function wireSello(el) {
  const btn = el.querySelector("[data-sello]");
  const nota = el.querySelector("#ficha-sello-nota");
  if (!btn || !nota) return;
  btn.addEventListener("click", () => {
    const abrir = nota.hidden;
    nota.hidden = !abrir;
    btn.setAttribute("aria-expanded", String(abrir));
  });
}

/**
 * La anotación se guarda sola. Un botón de "guardar" en un panel que se
 * reconstruye al cambiar de ficha es una forma segura de perder texto: se
 * escribe, se pincha otra estructura y se pierde. Con autoguardado a 500 ms
 * el texto sobrevive aunque no se toque nada más.
 */
function wireNotas(el, entry) {
  const cmp = el.querySelector("[data-comparar]");
  if (cmp) {
    cmp.addEventListener("click", () => {
      avisarComparar?.(entry);
      // En compacto la ficha vive en un drawer (en el teléfono, una hoja del
      // 88 % del alto) que tapa el visor: sin cerrarlo no había dónde pinchar
      // la segunda estructura, que es justo lo que pide el comparador.
      el.closest("sl-drawer")?.hide?.();
    });
  }

  const btn = el.querySelector("[data-fav]");
  if (btn) {
    btn.addEventListener("click", () => {
      const fav = alternarFavorito(entry.id);
      btn.classList.toggle("is-on", fav);
      btn.setAttribute("aria-pressed", String(fav));
      const etiqueta = fav ? "Quitar de favoritos" : "Marcar como favorito";
      btn.setAttribute("aria-label", etiqueta);
      btn.closest("sl-tooltip")?.setAttribute("content", etiqueta);
      btn.querySelector("svg")?.setAttribute("fill", fav ? "currentColor" : "none");
      avisarFavorito?.(entry.id, fav);
    });
  }

  const area = el.querySelector("[data-nota]");
  if (!area) return;
  const estado = el.querySelector(".ficha__nota-estado");
  let t = 0;
  const guardar = () => {
    const ok = guardarNota(entry.id, area.value);
    if (estado) {
      estado.textContent = ok
        ? area.value.trim()
          ? "Guardado"
          : ""
        : "No se ha podido guardar";
    }
  };
  area.addEventListener("input", () => {
    clearTimeout(t);
    if (estado) estado.textContent = "";
    t = setTimeout(guardar, 500);
  });
  // Cambiar de ficha destruye el textarea: hay que guardar antes de perderlo.
  area.addEventListener("blur", () => {
    clearTimeout(t);
    guardar();
  });
}

function wireLinks(el) {
  el.querySelectorAll("[data-navigate]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      onNavigate?.(btn.dataset.navigate);
    });
  });
}

// Toda la ficha se renderiza de una vez: las cuatro pestañas viven en un
// <sl-tab-group> (Shoelace) que gestiona ARIA, teclado y visibilidad. Cambiar
// de pestaña ya no re-renderiza nada.
function renderFicha(e, tab) {
  const sello = e.verificado ? SELLOS.verificado : SELLOS.pendiente;
  // El texto distingue los dos sellos, no solo el color; y el de «Sin
  // verificar» es neutro a propósito (ver sellos.js).
  const verifBadge = `
    <button type="button" class="ficha__sello" data-sello aria-expanded="false" aria-controls="ficha-sello-nota">
      <span class="${sello.clase}"><span aria-hidden="true">${sello.icono}</span> ${sello.texto}</span>
      <span class="sr-only">: qué significa</span>
    </button>`;
  return `
    <article class="ficha">
      <header class="ficha__header">
        <p class="ficha__crumb">${escapeHtml(regionParent(e.region))} › ${escapeHtml(regionLabel(e.region))}</p>
        <span class="ficha__kicker ficha__kicker--${escapeAttr(e.tipo)}">${escapeHtml(tipoLabel(e.tipo))} · ${escapeHtml(regionLabel(e.region))}</span>
        <h2 class="ficha__title">${escapeHtml(e.nombre_es)}</h2>
        <p class="ficha__latin" lang="la">${escapeHtml(e.nombre_la)}</p>
        <div class="ficha__meta">
          ${verifBadge}
          ${renderCodes(e)}
          ${renderFavorito(e)}
          ${renderComparar(e)}
        </div>
        <p class="ficha__sello-nota" id="ficha-sello-nota" hidden>
          ${sello.explicacion}
          <button type="button" class="link" data-abrir="acerca" data-seccion="sellos">Más sobre los sellos</button>
        </p>
      </header>
      <sl-tab-group class="ficha__tabs">
        ${TABS.map((t) => `<sl-tab slot="nav" panel="${t.id}">${t.label}</sl-tab>`).join("")}
        ${TABS.map(
          (t) => `<sl-tab-panel name="${t.id}"><div class="ficha__body">${renderTab(e, t.id)}</div></sl-tab-panel>`,
        ).join("")}
      </sl-tab-group>
      ${renderNota(e)}
    </article>
  `;
}

function renderComparar(e) {
  return `
    <sl-tooltip content="Comparar con otra estructura" hoist>
      <button type="button" class="ficha__cmp" data-comparar="${escapeAttr(e.id)}"
              aria-label="Comparar ${escapeHtml(e.nombre_es)} con otra estructura">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none"
             stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M9 5H4v14h5zM20 5h-5v14h5z"/><path d="M12 4v16"/>
        </svg>
      </button>
    </sl-tooltip>`;
}

function renderNota(e) {
  const { nota } = obtener(e.id);
  return `
    <sl-details class="ficha__nota" ${nota ? "open" : ""}>
      <span slot="summary">Mi anotación${nota ? `<span class="ficha__nota-marca" title="Tiene anotación" aria-label="tiene anotación"></span>` : ""}</span>
      <label class="sr-only" for="nota-${escapeAttr(e.id)}">Anotación sobre ${escapeHtml(e.nombre_es)}</label>
      <textarea id="nota-${escapeAttr(e.id)}" class="ficha__nota-texto" rows="3" maxlength="2000"
                data-nota="${escapeAttr(e.id)}"
                placeholder="Lo que no está en el libro: con qué la confundes, qué preguntó el profesor, cómo la palpas.">${escapeHtml(nota)}</textarea>
      <p class="ficha__nota-estado" aria-live="polite"></p>
    </sl-details>`;
}

function renderFavorito(e) {
  const fav = esFavorito(e.id);
  return `
    <sl-tooltip content="${fav ? "Quitar de favoritos" : "Marcar como favorito"}" hoist>
      <button type="button" class="ficha__fav${fav ? " is-on" : ""}" data-fav="${escapeAttr(e.id)}"
              aria-pressed="${fav}" aria-label="${fav ? "Quitar de favoritos" : "Marcar como favorito"}">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
             fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"
             stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/></svg>
      </button>
    </sl-tooltip>`;
}

function renderCodes(e) {
  const chips = [];
  // El campo se llama `ta2`, pero 101 fichas guardan el identificador de la
  // edición de 1998 (A04.6.02.006) y 52 el de la segunda (2458). Se rotula
  // cada uno con su edición para que el código se pueda buscar donde toca.
  if (e.ta2) {
    const ta98 = /^A\d{2}\./.test(e.ta2);
    const ed = ta98 ? "TA98" : "TA2";
    const desc = ta98 ? "Terminologia Anatomica (1998)" : "Terminologia Anatomica, 2.ª edición (2019)";
    chips.push(`<sl-tooltip content="${desc}" hoist><span class="ficha__code">${ed} ${escapeHtml(e.ta2)}</span></sl-tooltip>`);
  }
  if (e.fma) chips.push(`<sl-tooltip content="Foundational Model of Anatomy" hoist><span class="ficha__code">${escapeHtml(e.fma)}</span></sl-tooltip>`);
  return chips.length ? `<span class="ficha__codes">${chips.join("")}</span>` : "";
}

// Fuente como enlace clicable si hay URL; si no, texto en cursiva.
function sourceLink(fuente, url) {
  if (url) {
    const label = fuente ? escapeHtml(fuente) : "Ver fuente";
    return `<a class="ficha__source-link" href="${hrefAttr(url)}" target="_blank" rel="noopener">${label} ↗</a>`;
  }
  if (fuente) return `<span class="ficha__source">${escapeHtml(fuente)}</span>`;
  return "";
}

// Chips de huesos navegables (azul = origen, rojo = inserción) que al pulsarlos
// seleccionan el hueso y disparan el resaltado 3D.
function renderBoneChips(ids, kind) {
  if (!ids || !ids.length) return "";
  const chips = ids
    .map((id) => {
      const b = panelDb?.getById?.(id);
      const name = b ? b.nombre_es : id;
      return `<button type="button" class="bone-chip bone-chip--${kind}" data-navigate="${escapeAttr(id)}">${escapeHtml(name)}</button>`;
    })
    .join("");
  return `<div class="bone-chips">${chips}</div>`;
}

// El dataset se escribió en dos tandas con convenciones distintas: unas fichas
// usan `texto`/`nota`/`procedimiento` y otras `descripcion`. Nunca coexisten
// (verificado: 0 solapamientos), así que son alias. Antes solo se pintaba la
// primera forma y quedaban ~29 000 caracteres invisibles en 91 fragmentos.
/**
 * Enlaces a las fuentes de un fragmento.
 *
 * `fuente_url_2` existía en 22 fragmentos del dataset y la ficha NO la pintaba:
 * 16 de esas segundas fuentes son de StatPearls, es decir, la ficha enseñaba la
 * fuente débil (Physio-pedia, no comprobable) y escondía la verificable. Justo
 * al revés de lo que interesa, y justo lo contrario de la conclusión de la
 * auditoría: tener una segunda fuente accesible es lo que separa el 100 % de
 * aciertos del 42 %.
 */
function fuentes(o, etiqueta = "Ver fuente") {
  const urls = [o?.fuente_url, o?.fuente_url_2].filter(
    (u, i, a) => typeof u === "string" && u.trim() && a.indexOf(u) === i,
  );
  if (!urls.length) return "";
  return urls
    .map(
      (u, i) =>
        `<a class="ficha__source-link" href="${hrefAttr(u)}" target="_blank" rel="noopener">${
          urls.length > 1 ? `${etiqueta} ${i + 1}` : etiqueta
        } ↗</a>`,
    )
    .join("");
}

function texto(...candidatos) {
  for (const c of candidatos) {
    if (typeof c === "string" && c.trim()) return c;
  }
  return "";
}

function renderTab(e, tab) {
  if (tab === "info") return renderInfoTab(e);
  if (tab === "fisio") return renderFisioTab(e);
  if (tab === "images") return renderImagesTab(e);
  if (tab === "action") return renderActionTab(e);
  return "";
}

function renderFisioTab(e) {
  const f = e.fisio;
  if (!f) {
    return `
      <section class="ficha__section">
        <div class="fisio-empty">
          <h3>Fisioterapia: pendiente</h3>
          <p>Esta ficha aún no tiene tests clínicos, palpación ni pautas de tratamiento. Solo se añaden cuando hay una fuente que los respalde.</p>
        </div>
      </section>`;
  }

  const blocks = [];

  if (f.nota_fisio) {
    blocks.push(`
      <section class="ficha__section fisio-note">
        <h3>Nota clínica fisio</h3>
        <p>${escapeHtml(f.nota_fisio)}</p>
        ${f.nota_fisio_fuente_url ? `<a class="ficha__source-link" href="${hrefAttr(f.nota_fisio_fuente_url)}" target="_blank" rel="noopener">Ver fuente ↗</a>` : ""}
      </section>`);
  }

  if (f.tests_especiales?.length) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Tests clínicos especiales</h3>
        <div class="fisio-tests">
          ${f.tests_especiales.map((t) => `
            <article class="fisio-test">
              <header>
                <h4>${escapeHtml(t.nombre)}</h4>
                <span class="fisio-test__target">${escapeHtml(t.estructura_evaluada ?? "")}</span>
              </header>
              ${t.posicion_paciente ? `<p><strong>Posición:</strong> ${escapeHtml(t.posicion_paciente)}</p>` : ""}
              ${texto(t.procedimiento, t.descripcion) ? `<p><strong>Procedimiento:</strong> ${escapeHtml(texto(t.procedimiento, t.descripcion))}</p>` : ""}
              ${t.positivo ? `<p><strong>Positivo:</strong> ${escapeHtml(t.positivo)}</p>` : ""}
              ${fuentes(t)}
            </article>
          `).join("")}
        </div>
      </section>`);
  }

  if (f.patologias_comunes?.length) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Patologías frecuentes</h3>
        <ul class="fisio-patologias" role="list">
          ${f.patologias_comunes.map((p) => `
            <li>
              <strong>${escapeHtml(p.nombre)}.</strong> ${escapeHtml(texto(p.nota, p.descripcion))}
              ${fuentes(p, "fuente")}
            </li>
          `).join("")}
        </ul>
      </section>`);
  }

  if (f.palpacion) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Palpación</h3>
        <p>${escapeHtml(texto(f.palpacion.texto, f.palpacion.descripcion))}</p>
        ${fuentes(f.palpacion)}
      </section>`);
  }

  if (f.mmt) {
    // Este bloque era el único de `fisio` que no pasaba por `texto()`: pintaba
    // solo posición, resistencia y fuente. Las 104 fichas con MMT usan hoy
    // exactamente esas tres claves, así que no había nada oculto — pero un
    // `mmt.texto` o un `mmt.descripcion` futuros habrían desaparecido en
    // silencio, que es justo como se perdieron 29 000 caracteres una vez.
    const cuerpoMmt = texto(f.mmt.texto, f.mmt.descripcion, f.mmt.procedimiento, f.mmt.nota);
    blocks.push(`
      <section class="ficha__section">
        <h3>Test Muscular Manual (MMT)</h3>
        ${cuerpoMmt ? `<p>${escapeHtml(cuerpoMmt)}</p>` : ""}
        ${f.mmt.posicion_paciente ? `<p><strong>Posición:</strong> ${escapeHtml(f.mmt.posicion_paciente)}</p>` : ""}
        ${f.mmt.resistencia ? `<p><strong>Resistencia:</strong> ${escapeHtml(f.mmt.resistencia)}</p>` : ""}
        ${fuentes(f.mmt)}
      </section>`);
  }

  if (f.puntos_gatillo) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Puntos gatillo y dolor referido</h3>
        <p>${escapeHtml(texto(f.puntos_gatillo.texto, f.puntos_gatillo.descripcion))}</p>
        ${fuentes(f.puntos_gatillo)}
      </section>`);
  }

  if (f.estiramiento) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Estiramiento clave</h3>
        <p>${escapeHtml(texto(f.estiramiento.texto, f.estiramiento.descripcion))}</p>
        ${fuentes(f.estiramiento)}
      </section>`);
  }

  if (f.fortalecimiento) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Fortalecimiento</h3>
        <p>${escapeHtml(texto(f.fortalecimiento.texto, f.fortalecimiento.descripcion))}</p>
        ${fuentes(f.fortalecimiento)}
      </section>`);
  }

  if (f.ultima_verificacion) {
    blocks.push(`
      <div class="fisio-verification-footer">
        <span>Última verificación: ${escapeHtml(f.ultima_verificacion)}</span>
      </div>`);
  }

  return blocks.join("") || `<p class="info-panel__empty">Sin contenido de fisioterapia.</p>`;
}

function renderInfoTab(e) {
  const blocks = [];

  if (e.origen?.length) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Origen</h3>
        <ul>
          ${e.origen
            .map(
              (o) => `
            <li>
              ${o.cabeza ? `<strong>${escapeHtml(o.cabeza)}:</strong> ` : ""}${escapeHtml(o.lugar)}
              ${sourceLink(o.fuente, o.fuente_url)}
            </li>`,
            )
            .join("")}
        </ul>
        ${renderBoneChips(e.origen_huesos, "origin")}
      </section>`);
  }

  if (e.insercion?.length) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Inserción</h3>
        <ul>
          ${e.insercion
            .map(
              (i) => `
            <li>
              ${escapeHtml(i.lugar)}
              ${sourceLink(i.fuente, i.fuente_url)}
            </li>`,
            )
            .join("")}
        </ul>
        ${renderBoneChips(e.insercion_huesos, "insertion")}
      </section>`);
  }

  if (e.inervacion) {
    const raices = e.inervacion.raices
      ? e.inervacion.raices.map((r) => `<span class="chip">${escapeHtml(r)}</span>`).join("")
      : "";
    // If the inervacion.nervio text resolves to a nerve entry in the db,
    // render it as a navigate link.
    const nerveEntry = panelDb?.findNerveByName?.(e.inervacion.nervio);
    const nerveHtml = nerveEntry
      ? `<p><button type="button" class="link" data-navigate="${escapeAttr(nerveEntry.id)}">${escapeHtml(e.inervacion.nervio)}</button></p>`
      : `<p>${escapeHtml(e.inervacion.nervio)}</p>`;
    blocks.push(`
      <section class="ficha__section">
        <h3>Inervación</h3>
        ${nerveHtml}
        <div>${raices}</div>
        ${sourceLink(e.inervacion.fuente, e.inervacion.fuente_url)}
      </section>`);
  }

  // Reverse lookup: if this is a nerve, list the muscles it innervates.
  if (e.tipo === "nerve" && panelDb?.musclesInnervatedBy) {
    const muscles = panelDb.musclesInnervatedBy(e);
    if (muscles.length) {
      blocks.push(`
        <section class="ficha__section">
          <h3>Músculos inervados</h3>
          <div class="chip-grid">
            ${muscles
              .map(
                (m) => `
                <button type="button" class="chip chip--link" data-navigate="${escapeAttr(m.id)}">${escapeHtml(m.nombre_es)}</button>
              `,
              )
              .join("")}
          </div>
        </section>`);
    }
  }

  if (e.irrigacion) {
    blocks.push(`
      <section class="ficha__section">
        <h3>Irrigación</h3>
        <p>${escapeHtml(e.irrigacion)}</p>
      </section>`);
  }

  if (e.relevancia_clinica) {
    blocks.push(`
      <section class="ficha__section">
        <div class="ficha__clinical">
          <strong>Relevancia clínica</strong>
          ${escapeHtml(e.relevancia_clinica)}
        </div>
      </section>`);
  }

  // Reverse lookup para HUESOS: qué músculos se originan / insertan aquí.
  if (e.tipo === "bone" && panelDb?.all) {
    const all = panelDb.all();
    const originM = all.filter((m) => m.tipo === "muscle" && (m.origen_huesos || []).includes(e.id));
    const insertM = all.filter((m) => m.tipo === "muscle" && (m.insercion_huesos || []).includes(e.id));
    const chipList = (arr) =>
      arr
        .map((m) => `<button type="button" class="chip chip--link" data-navigate="${escapeAttr(m.id)}">${escapeHtml(m.nombre_es)}</button>`)
        .join("");
    if (originM.length) {
      blocks.push(`
        <section class="ficha__section">
          <h3>Músculos que se originan aquí</h3>
          <div class="chip-grid">${chipList(originM)}</div>
        </section>`);
    }
    if (insertM.length) {
      blocks.push(`
        <section class="ficha__section">
          <h3>Músculos que se insertan aquí</h3>
          <div class="chip-grid">${chipList(insertM)}</div>
        </section>`);
    }
  }

  // Fuentes verificadas (URLs consultadas).
  if (e.fuentes_verificadas?.length) {
    blocks.push(`
      <section class="ficha__section ficha__fuentes">
        <h3>Fuentes verificadas</h3>
        <ul class="ficha__fuentes-list" role="list">
          ${e.fuentes_verificadas
            .map((u) => {
              let host = u;
              try { host = new URL(u).hostname.replace(/^www\./, ""); } catch (_) {}
              return `<li><a class="ficha__source-link" href="${hrefAttr(u)}" target="_blank" rel="noopener">${escapeHtml(host)} ↗</a></li>`;
            })
            .join("")}
        </ul>
      </section>`);
  }

  return blocks.join("") || `<p class="info-panel__empty">Sin información todavía.</p>`;
}

function renderImagesTab(e) {
  return renderGallery(e.imagenes ?? []);
}

function renderActionTab(e) {
  // Los ligamentos no "accionan": estabilizan. El dataset lo recoge en `funcion`
  // (33 fichas), que hasta ahora no se pintaba en ningún sitio y dejaba esta
  // pestaña vacía en todos los ligamentos.
  if (!e.accion?.length) {
    if (e.funcion) {
      return `
    <section class="ficha__section">
      <h3>${e.tipo === "ligament" ? "Función estabilizadora" : "Función"}</h3>
      <p>${escapeHtml(e.funcion)}</p>
    </section>`;
    }
    // Un hueso no tiene acción: lo mueven los músculos que se insertan en él.
    // «Sin datos de acción» en las 132 fichas óseas se leía como contenido
    // que faltaba, cuando es la respuesta anatómica correcta; se dice así y
    // se enseña quién lo mueve, que es lo que se busca en esta pestaña.
    if (e.tipo === "bone") {
      const lo_mueven = (panelDb?.all?.() ?? []).filter(
        (m) => m.tipo === "muscle" && (m.insercion_huesos || []).includes(e.id),
      );
      return `
    <section class="ficha__section">
      <h3>Movimiento</h3>
      <p>Un hueso no tiene acción propia: lo mueven los músculos que se insertan en él${lo_mueven.length ? "." : ", y ningún músculo del atlas declara todavía su inserción aquí."}</p>
      ${lo_mueven.length ? `<div class="chip-grid">${lo_mueven
        .map((m) => `<button type="button" class="chip chip--link" data-navigate="${escapeAttr(m.id)}">${escapeHtml(m.nombre_es)}</button>`)
        .join("")}</div>` : ""}
    </section>`;
    }
    return `<p class="info-panel__empty">${e.tipo === "ligament" ? "Esta ficha todavía no describe su función estabilizadora." : "Sin datos de acción."}</p>`;
  }
  return `
    <section class="ficha__section">
      <h3>Acciones principales</h3>
      <ul>${e.accion.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
      ${renderRelacionados("Antagonistas", e.antagonistas)}
      ${renderRelacionados("Sinergistas", e.sinergistas)}
    </section>`;
}

/**
 * Antagonistas y sinergistas. Una pastilla sirve para un nombre («Tríceps
 * braquial»), no para una frase: 390 de las 913 entradas del catálogo pasan de
 * 40 caracteres y la más larga llega a 323. En pastilla monoespaciada salían
 * como bloques de tres o cuatro renglones con los extremos redondeados y el
 * texto pegado al borde. Si alguna entrada del grupo es una frase, el grupo
 * entero se lee como lista, igual que las acciones; si todas son nombres,
 * siguen siendo pastillas.
 */
function renderRelacionados(titulo, lista) {
  if (!lista?.length) return "";
  const esFrase = lista.some((a) => String(a).length > 40);
  const cuerpo = esFrase
    ? `<ul>${lista.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>`
    : `<p>${lista.map((a) => `<span class="chip">${escapeHtml(a)}</span>`).join("")}</p>`;
  return `<h3 style="margin-top:18px">${titulo}</h3>${cuerpo}`;
}

// Shoelace emite `sl-tab-show` con el nombre del panel: se recuerda para la
// próxima ficha y se anima la entrada del panel recién visible.
function wireTabs(el) {
  const group = el.querySelector("sl-tab-group");
  if (!group) return;

  group.addEventListener("sl-tab-show", (ev) => {
    activeTab = ev.detail.name;
    enterTabPanel(group.querySelector(`sl-tab-panel[name="${activeTab}"]`));
  });

  // NO se marca `active` en el HTML a propósito. `setActiveTab()` de Shoelace
  // hace early-return cuando el tab pedido ya es el activo, así que un
  // `<sl-tab active>` inicial dejaba el grupo con la pestaña marcada pero los
  // paneles SIN sincronizar: la ficha salía con el encabezado y el cuerpo en
  // blanco, y `show()` no lo arreglaba porque también salía por el early-return.
  // Sin `active`, `group.activeTab` arranca vacío y `show()` siempre encuentra
  // un cambio real que aplicar — que es lo que sincroniza los paneles.
  Promise.all(
    ["sl-tab-group", "sl-tab", "sl-tab-panel"].map((n) => customElements.whenDefined(n)),
  ).then(async () => {
    if (!group.isConnected) return;
    // Esperar al primer render de Lit y, si aún no ha recogido los hijos del
    // slot, a un frame más: show() busca el tab en `group.tabs`, y si lo
    // llamamos antes de que esa lista exista no encuentra nada y no hace nada.
    await group.updateComplete;
    // El autoloader define cada componente por separado y `sl-tab-group` puede
    // resolver antes que `sl-tab`: de ahí la espera a los tres. Aun así, la
    // primera ficha de la sesión puede llegar antes de que el grupo recoja los
    // hijos del slot, así que se reintenta de forma acotada.
    for (let i = 0; i < 12 && !group.tabs?.length; i++) {
      await new Promise((r) => requestAnimationFrame(r));
    }
    if (group.isConnected) group.show(activeTab);
  });
}

function wireGallery(el, entry) {
  // El disparador es un <button> real: un <figure> no es focusable, así que
  // las imágenes solo se podían ampliar con el ratón.
  el.querySelectorAll(".gallery__open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = entry.imagenes?.[Number(btn.dataset.idx)];
      if (!img) return;
      window.dispatchEvent(new CustomEvent("lightbox:open", { detail: img }));
    });
  });
  // El onerror en línea rompería bajo CSP y no comunicaba el fallo.
  el.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.opacity = "0.15";
      img.alt = "Imagen no disponible";
    }, { once: true });
  });
}

function regionLabel(r) {
  if (REGION_LABELS[r]) return REGION_LABELS[r];
  const s = String(r ?? "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function tipoLabel(t) { return TIPO_LABELS[t] ?? t; }

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

// Seguridad: solo permitir esquemas http(s) o rutas locales en hrefs.
// Bloquea javascript:, data:, etc. (las URLs provienen de investigación web).
function safeHref(url) {
  const u = String(url ?? "").trim();
  // "//host" lo resuelve el navegador como URL absoluta externa
  if (u.startsWith("//")) return "#";
  if (/^https?:\/\//i.test(u) || /^assets\//i.test(u) || u.startsWith("/")) return u;
  return "#";
}
function hrefAttr(url) { return escapeAttr(safeHref(url)); }
