import { LAYERS } from "../viewer/layers.js";
import { enterList } from "./motion.js";
import { recent, clearRecent } from "./session.js";
import { favoritos } from "./notas.js";

const EYE_ON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 6.1A10.6 10.6 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4M6.6 6.6A16.8 16.8 0 0 0 2 13s3.5 7 10 7a10.5 10.5 0 0 0 4.3-.9"/></svg>`;

export const REGION_LABELS = {
  cabeza: "Cabeza",
  cuello: "Cuello",
  torax: "Tórax",
  abdomen: "Abdomen",
  hombro: "Hombro",
  brazo: "Brazo",
  antebrazo: "Antebrazo",
  mano: "Mano",
  cadera: "Cadera",
  muslo: "Muslo",
  pierna: "Pierna",
  pie: "Pie",
};

// Raíz del breadcrumb por región: estaba fija en "Miembro superior", así que
// el glúteo mayor aparecía como "Miembro superior › Cadera".
export const REGION_PARENT = {
  // El cuello cuelga de "Cabeza y cuello", no de "Tronco": es lo correcto
  // anatómicamente y ahora que existe la región cabeza tiene con qué agruparse.
  cabeza: "Cabeza y cuello",
  cuello: "Cabeza y cuello",
  torax: "Tronco",
  abdomen: "Tronco",
  hombro: "Miembro superior",
  brazo: "Miembro superior",
  antebrazo: "Miembro superior",
  mano: "Miembro superior",
  cadera: "Miembro inferior",
  muslo: "Miembro inferior",
  pierna: "Miembro inferior",
  pie: "Miembro inferior",
};

export function regionParent(region) {
  return REGION_PARENT[region] ?? "Atlas";
}

// Orden anatómico cráneo-caudal y próximo-distal, no el de aparición en el JSON.
const REGION_ORDER = [
  "cabeza", "cuello", "torax", "abdomen",
  "hombro", "brazo", "antebrazo", "mano",
  "cadera", "muslo", "pierna", "pie",
];
const TIPO_ORDER = ["muscle", "bone", "nerve", "ligament", "tendon", "fascia"];
// Única definición: antes vivía duplicada en search.js e info-panel.js, y por
// eso los tipos `tendon` y `fascia` tenían color pero no etiqueta en unos sitios.
export const TIPO_LABELS = {
  muscle: "Músculo",
  bone: "Hueso",
  nerve: "Nervio",
  ligament: "Ligamento",
  fascia: "Fascia",
  tendon: "Tendón",
};

export const TIPO_COLOR = {
  muscle: "var(--muscle)",
  bone: "var(--bone)",
  nerve: "var(--nerve)",
  ligament: "var(--ligament)",
  tendon: "var(--tendon)",
  fascia: "var(--text-2)",
};

/**
 * Barra lateral: capas + regiones.
 * Las regiones son un acordeón (<sl-details>): abrir una región DESPLIEGA
 * su lista de estructuras; nunca selecciona nada por su cuenta.
 *  - onEntry(id)     → el usuario eligió una estructura de la lista
 *  - onRegion(region)→ el usuario abrió una región (hook opcional)
 */
export function initSidebar({ layers, db, onRegion, onEntry }) {
  const layerList = document.getElementById("layer-list");
  const regionList = document.getElementById("region-list");

  layerList.innerHTML = LAYERS.map(
    (l) => `
    <li>
      <button type="button" data-layer="${l.id}" aria-pressed="${layers.isOn(l.id)}">
        <span class="eye">${layers.isOn(l.id) ? EYE_ON : EYE_OFF}</span>
        <span>${l.label}</span>
      </button>
    </li>`,
  ).join("");

  layerList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const on = layers.toggle(btn.dataset.layer);
      btn.setAttribute("aria-pressed", on);
      btn.querySelector(".eye").innerHTML = on ? EYE_ON : EYE_OFF;
    });
  });

  const groups = db.byRegion();
  const regions = [...groups.keys()].sort(
    (a, b) => orderIndex(REGION_ORDER, a) - orderIndex(REGION_ORDER, b),
  );

  regionList.innerHTML = regions
    .map((region) => {
      const entries = [...groups.get(region)].sort(
        (a, b) =>
          orderIndex(TIPO_ORDER, a.tipo) - orderIndex(TIPO_ORDER, b.tipo) ||
          a.nombre_es.localeCompare(b.nombre_es, "es"),
      );
      return `
      <sl-details data-region="${escapeAttr(region)}">
        <span slot="summary" class="region__summary">
          <span>${escapeHtml(REGION_LABELS[region] ?? capitalize(region))}</span>
          <span class="region__count">${entries.length}</span>
        </span>
        <ul class="region__items" role="list">
          ${entries
            .map(
              (e) => `
            <li>
              <button type="button" data-entry="${escapeAttr(e.id)}">
                <span class="n"><span class="region__dot" style="background:${TIPO_COLOR[e.tipo] ?? "var(--text-2)"}" aria-hidden="true"></span><span class="sr-only">${escapeHtml(TIPO_LABELS[e.tipo] ?? e.tipo)}: </span>${escapeHtml(e.nombre_es)}</span>
                <em>${escapeHtml(e.nombre_la)}</em>
              </button>
            </li>`,
            )
            .join("")}
        </ul>
      </sl-details>`;
    })
    .join("");

  regionList.querySelectorAll("sl-details").forEach((det) => {
    det.addEventListener("sl-show", () => {
      enterList(det.querySelectorAll(".region__items li"));
      onRegion?.(det.dataset.region);
    });
  });

  regionList.querySelectorAll("button[data-entry]").forEach((btn) => {
    btn.addEventListener("click", () => onEntry?.(btn.dataset.entry));
  });

  // Región que abrió la propia selección, no el usuario. Cada ficha abría su
  // región y ninguna se cerraba: tras recorrer cuatro fichas de cuatro
  // regiones (o unas cuantas con J/K) la barra lateral tenía cuatro acordeones
  // abiertos y un par de cientos de filas, y pulsar la cabecera de una región
  // ya abierta la CERRABA cuando se quería ver. Ahora solo sigue abierta la de
  // la estructura activa; las que el usuario abre a mano no se tocan.
  let abiertaPorSeleccion = null;

  /** Marca la estructura activa y abre su región (p. ej. tras un clic en 3D). */
  function setActive(id) {
    regionList.querySelectorAll("button[data-entry]").forEach((b) => {
      b.setAttribute("aria-current", b.dataset.entry === id ? "true" : "false");
    });
    if (!id) return;
    const btn = regionList.querySelector(`button[data-entry="${cssEscape(id)}"]`);
    const det = btn?.closest("sl-details");
    if (abiertaPorSeleccion && abiertaPorSeleccion !== det) {
      abiertaPorSeleccion.open = false;
      abiertaPorSeleccion = null;
    }
    if (det && !det.open) {
      det.open = true;
      abiertaPorSeleccion = det;
    }
    btn?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // ---- Vistas recientemente -------------------------------------------
  const favBlock = document.getElementById("fav-block");
  const favList = document.getElementById("fav-list");
  const recentBlock = document.getElementById("recent-block");
  const recentList = document.getElementById("recent-list");

  function renderRecent(list = recent()) {
    if (!recentBlock || !recentList) return;
    recentBlock.hidden = list.length === 0;
    recentList.setAttribute("role", "list");
    recentList.innerHTML = list
      .map(
        (r) => `
      <li>
        <button type="button" data-entry="${escapeAttr(r.id)}">
          <span class="region__dot" style="background:${TIPO_COLOR[r.tipo] ?? "var(--text-2)"}" aria-hidden="true"></span>
          <span class="sr-only">${escapeHtml(TIPO_LABELS[r.tipo] ?? r.tipo ?? "")}: </span>
          <span class="n">${escapeHtml(r.nombre)}</span>
          <span>${escapeHtml(REGION_LABELS[r.region] ?? r.region ?? "")}</span>
        </button>
      </li>`,
      )
      .join("");
    recentList.querySelectorAll("button[data-entry]").forEach((btn) => {
      btn.addEventListener("click", () => onEntry?.(btn.dataset.entry));
    });
  }

  /**
   * Favoritos en la barra lateral. Marcar una estructura no sirve de nada si
   * luego no hay dónde encontrarla: el favorito solo existe si se puede volver.
   */
  function renderFavoritos() {
    if (!favBlock || !favList) return;
    const ids = favoritos()
      .map((id) => db.getById(id))
      .filter(Boolean);
    favBlock.hidden = ids.length === 0;
    favList.innerHTML = ids
      .map(
        (e) => `
      <li>
        <button type="button" data-entry="${escapeAttr(e.id)}">
          <span class="region__dot" style="background:${TIPO_COLOR[e.tipo] ?? "var(--text-2)"}" aria-hidden="true"></span>
          <span class="sr-only">${escapeHtml(TIPO_LABELS[e.tipo] ?? e.tipo ?? "")}: </span>
          <span class="n">${escapeHtml(e.nombre_es)}</span>
          <span>${escapeHtml(REGION_LABELS[e.region] ?? e.region ?? "")}</span>
        </button>
      </li>`,
      )
      .join("");
    favList.querySelectorAll("button[data-entry]").forEach((btn) => {
      btn.addEventListener("click", () => onEntry?.(btn.dataset.entry));
    });
  }

  renderFavoritos();

  document.getElementById("recent-clear")?.addEventListener("click", () => {
    clearRecent();
    renderRecent([]);
  });

  renderRecent();

  /**
   * Lista plana de ids en el MISMO orden en que se muestran en la barra
   * lateral (región cráneo-caudal, y dentro de cada una por tipo y nombre).
   * La navegación con teclado la recorre, para que moverse con el teclado y
   * leer la lista sean la misma secuencia.
   */
  function ordenNavegacion() {
    const out = [];
    for (const region of regions) {
      for (const e of [...groups.get(region)].sort(
        (a, b) =>
          orderIndex(TIPO_ORDER, a.tipo) - orderIndex(TIPO_ORDER, b.tipo) ||
          a.nombre_es.localeCompare(b.nombre_es, "es"),
      )) {
        out.push(e.id);
      }
    }
    return out;
  }

  return { setActive, renderRecent, renderFavoritos, ordenNavegacion };
}

export function setBreadcrumb(entry) {
  const bc = document.getElementById("breadcrumb");
  if (!entry) {
    bc.innerHTML = "<span>Atlas anatómico</span>";
    return;
  }
  bc.innerHTML = `
    <span>${escapeHtml(regionParent(entry.region))}</span>
    <span>${escapeHtml(REGION_LABELS[entry.region] ?? capitalize(entry.region))}</span>
    <span>${escapeHtml(entry.nombre_es)}</span>`;
}

function orderIndex(list, key) {
  const i = list.indexOf(key);
  return i === -1 ? list.length : i;
}

function capitalize(s) {
  s = String(s ?? "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cssEscape(s) {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
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
