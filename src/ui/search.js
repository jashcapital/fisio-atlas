import Fuse from "fuse.js";
import { REGION_LABELS, TIPO_LABELS } from "./sidebar.js";

// Etiqueta del campo por el que ha entrado el resultado, para que se entienda
// por qué aparece "Coracobraquial" al escribir "musculocutáneo".
const FIELD_LABELS = {
  nombre: null, // coincidencia por nombre: no hace falta explicarla
  latin: null,
  accion: "acción",
  nervio: "inervación",
  raices: "raíz",
  patologias: "patología",
  clinica: "clínica",
  region: "región",
  tipo: "tipo",
};

/** Quita diacríticos manteniendo la longitud carácter a carácter, para que los
 *  índices de coincidencia de Fuse sigan siendo válidos sobre el texto original. */
function norm(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .toLowerCase();
}

function buildDoc(e) {
  const fisio = e.fisio ?? {};
  return {
    ref: e,
    nombre: norm(e.nombre_es),
    latin: norm(e.nombre_la),
    accion: norm([...(e.accion ?? []), e.funcion].filter(Boolean).join(" · ")),
    nervio: norm(e.inervacion?.nervio),
    raices: norm((e.inervacion?.raices ?? []).join(" ")),
    patologias: norm(
      [
        ...(fisio.patologias_comunes ?? []).map((p) => `${p.nombre} ${p.nota ?? ""}`),
        ...(fisio.tests_especiales ?? []).map((t) => t.nombre),
        fisio.nota_fisio,
      ]
        .filter(Boolean)
        .join(" · "),
    ),
    clinica: norm(e.relevancia_clinica),
    region: norm(REGION_LABELS[e.region] ?? e.region),
    tipo: norm(TIPO_LABELS[e.tipo] ?? e.tipo),
  };
}

const FUSE_OPTIONS = {
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true, // la coincidencia vale igual al principio que al final
  threshold: 0.36, // tolera erratas sin devolver ruido
  minMatchCharLength: 2,
  keys: [
    { name: "nombre", weight: 0.4 },
    { name: "latin", weight: 0.24 },
    { name: "accion", weight: 0.1 },
    { name: "nervio", weight: 0.08 },
    { name: "patologias", weight: 0.08 },
    { name: "raices", weight: 0.05 },
    // `clinica` es texto largo y muy repetido entre estructuras vecinas (los
    // cinco metacarpianos mencionan el túnel del carpo): peso casi residual
    // para que no desplace a la estructura protagonista de la patología.
    { name: "clinica", weight: 0.012 },
    { name: "region", weight: 0.02 },
    { name: "tipo", weight: 0.02 },
  ],
};

export function initSearch({ db, onSelect }) {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const live = document.getElementById("search-live");
  const announce = (msg) => {
    if (live) live.textContent = msg;
  };
  let activeIdx = -1;
  let matches = [];

  // «Sin resultados» también es una respuesta. Antes el desplegable
  // simplemente no aparecía, y no había forma de distinguir «no hay nada» de
  // «el buscador no ha reaccionado». Va fuera del listbox: dentro, un elemento
  // que no es una opción rompe el patrón ARIA del combobox.
  const vacio = document.createElement("p");
  vacio.className = "search__vacio";
  vacio.hidden = true;
  results.after(vacio);

  function mostrarVacio(q) {
    const sin = !matches.length && norm(q).length >= 2;
    vacio.hidden = !sin;
    if (!sin) return;
    vacio.innerHTML = `Sin resultados para «${escapeHtml(q)}».<span>Prueba con el nombre latino, una acción o un nervio.</span>`;
    announce("Sin resultados");
  }

  const fuse = new Fuse(db.all().map(buildDoc), FUSE_OPTIONS);

  // Atajos de intención clínica (data/sinonimos.json). Se cargan sin bloquear:
  // hasta que llegan, el buscador funciona exactamente como antes.
  let atajos = [];
  let fuseAtajos = null;
  cargarAtajos(db).then((r) => {
    atajos = r.atajos;
    fuseAtajos = r.fuse;
  });

  // Nombres propios del catálogo, normalizados. Si lo tecleado empieza el
  // nombre de una estructura real, esa estructura gana: quien escribe
  // "pisiforme" quiere el hueso del carpo, no el síndrome del piriforme.
  const nombresCatalogo = db
    .all()
    .flatMap((e) => [norm(e.nombre_es), norm(e.nombre_la)])
    .filter(Boolean);

  // Por qué un diccionario y no más re-ranking: se midieron tres estrategias
  // (cobertura de términos, cobertura con límite de palabra, y ponderada por
  // campo) contra 15 consultas reales. Ninguna superó al ranking actual y dos
  // introdujeron regresiones. La causa es el dataset, no el algoritmo: 44
  // fichas mencionan el túnel carpiano en sus patologías y ninguna se declara
  // protagonista. Esa señal no se deduce, se declara.
  function search(q) {
    const nq = norm(q);
    if (nq.length < 2) return [];
    const base = fuse.search(nq, { limit: 12 });
    const destacados = buscarAtajo(nq);
    if (!destacados.length) return base;
    const vistos = new Set(destacados.map((d) => d.item.ref.id));
    return [...destacados, ...base.filter((r) => !vistos.has(r.item.ref.id))].slice(0, 12);
  }

  function buscarAtajo(nq) {
    if (!fuseAtajos) return [];
    // Un nombre real del catálogo nunca cede ante un atajo. Sin esta regla, la
    // tolerancia a erratas de Fuse hacía que "pisiforme" (hueso del carpo)
    // abriera el síndrome del piriforme, "ilion" el iliopsoas y "menisco
    // lateral" el esguince del colateral medial: 6 colisiones sobre los 319
    // nombres del catálogo, todas medidas.
    if (nombresCatalogo.some((n) => n.startsWith(nq))) return [];
    const hit = fuseAtajos.search(nq, { limit: 1 })[0];
    if (!hit) return [];
    // La consulta debe cubrir la mayor parte de la forma escrita, o "biceps"
    // dispararía «rotura del bíceps» en vez de llevar al músculo. Las formas
    // cortas de verdad ("popeye", "quervain") están listadas aparte en el JSON.
    if (nq.length / hit.item.q.length < 0.55) return [];
    const a = atajos[hit.item.i];
    return a.refs.map((ref) => ({ item: { ref }, score: 0, matches: [], atajo: a.etiqueta }));
  }

  function render() {
    if (!matches.length) {
      results.hidden = true;
      results.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      announce("");
      return;
    }
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    results.innerHTML = matches
      .map((m, i) => {
        const e = m.item.ref;
        const best = bestMatch(m.matches);
        const why = m.atajo ?? FIELD_LABELS[best?.key];
        // Solo se resalta cuando la coincidencia fue en el nombre: en los demás
        // campos el texto mostrado no es el que casó.
        const nombre =
          best?.key === "nombre"
            ? highlight(e.nombre_es, best.indices)
            : escapeHtml(e.nombre_es);
        return `
      <li id="sr-opt-${i}" data-idx="${i}" role="option" aria-selected="${i === activeIdx}"${m.atajo ? ' class="is-destacado"' : ""}>
        <span class="sr-row">
          <span class="sr-dot sr-dot--${escapeAttr(e.tipo)}" aria-hidden="true"></span>
          <span class="sr-only">${escapeHtml(TIPO_LABELS[e.tipo] ?? e.tipo)}: </span>
          <strong>${nombre}</strong>
          <span class="sr-tag">${escapeHtml(REGION_LABELS[e.region] ?? e.region)}</span>
        </span>
        <em>${escapeHtml(e.nombre_la)}</em>
        ${why ? `<span class="sr-why">${m.atajo ? "" : "coincide en "}${escapeHtml(why)}</span>` : ""}
      </li>`;
      })
      .join("");

    announce(`${matches.length} resultado${matches.length === 1 ? "" : "s"}`);
    syncActive();

    results.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => pick(Number(li.dataset.idx)));
      li.addEventListener("mousemove", () => {
        const idx = Number(li.dataset.idx);
        if (idx === activeIdx) return;
        activeIdx = idx;
        syncActive();
      });
    });
  }

  /** Mueve la selección sin repintar la lista entera. */
  function syncActive() {
    results.querySelectorAll("li").forEach((li, i) => {
      li.setAttribute("aria-selected", i === activeIdx);
      if (i === activeIdx) li.scrollIntoView({ block: "nearest" });
    });
    // Sin aria-activedescendant el resaltado se movía visualmente pero un
    // lector de pantalla no leía nada: se navegaba a ciegas.
    if (activeIdx >= 0) input.setAttribute("aria-activedescendant", `sr-opt-${activeIdx}`);
    else input.removeAttribute("aria-activedescendant");
  }

  function pick(idx) {
    const m = matches[idx];
    if (!m) return;
    input.value = "";
    matches = [];
    activeIdx = -1;
    render();
    vacio.hidden = true;
    input.blur();
    onSelect?.(m.item.ref);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    matches = search(q);
    activeIdx = matches.length ? 0 : -1;
    render();
    mostrarVacio(q);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, matches.length - 1);
      syncActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      syncActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(activeIdx >= 0 ? activeIdx : 0);
    } else if (e.key === "Escape") {
      matches = [];
      input.value = "";
      activeIdx = -1;
      render();
      vacio.hidden = true;
      input.blur();
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.hidden = true;
      vacio.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
  });

  // Al enfocar, si ya hay texto se vuelven a mostrar los resultados.
  input.addEventListener("focus", () => {
    if (matches.length) results.hidden = false;
    else mostrarVacio(input.value.trim());
  });
}

/** El campo con mejor coincidencia, priorizando el tramo contiguo más largo. */
function bestMatch(list) {
  if (!list?.length) return null;
  const span = (m) => Math.max(...m.indices.map(([a, b]) => b - a + 1));
  return [...list].sort((a, b) => span(b) - span(a))[0];
}

function highlight(text, indices) {
  if (!indices?.length) return escapeHtml(text);
  // Solo el tramo contiguo más largo: marcar todos los fragmentos sueltos que
  // devuelve Fuse deja el nombre convertido en confeti ilegible.
  const [start, end] = [...indices].sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
  return (
    escapeHtml(text.slice(0, start)) +
    `<mark>${escapeHtml(text.slice(start, end + 1))}</mark>` +
    escapeHtml(text.slice(end + 1))
  );
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

/**
 * Carga el diccionario de intención clínica. Cada FORMA de escribirlo es un
 * documento propio: comparar contra un saco de variantes concatenadas daría
 * coincidencias por acumulación, no por parecido con lo que se tecleó.
 */
async function cargarAtajos(db) {
  try {
    const res = await fetch(`data/sinonimos.json?t=${Date.now()}`, { cache: "no-cache" });
    if (!res.ok) return { atajos: [], fuse: null };
    const json = await res.json();
    const atajos = (json.entradas ?? [])
      .map((e) => ({ ...e, refs: (e.ids ?? []).map((id) => db.getById(id)).filter(Boolean) }))
      .filter((e) => e.refs.length);
    const faltan = (json.entradas ?? []).flatMap((e) =>
      (e.ids ?? []).filter((id) => !db.getById(id)),
    );
    if (faltan.length) {
      console.warn(`[fisio-atlas] sinonimos.json apunta a ids inexistentes: ${faltan.join(", ")}`);
    }
    const docs = atajos.flatMap((a, i) => (a.q ?? []).map((q) => ({ q: norm(q), i })));
    const fuse = new Fuse(docs, {
      includeScore: true,
      keys: ["q"],
      threshold: 0.24, // estricto: un atajo que se dispara de más estorba
      ignoreLocation: true,
      minMatchCharLength: 3,
    });
    return { atajos, fuse };
  } catch {
    return { atajos: [], fuse: null }; // sin atajos el buscador sigue entero
  }
}
