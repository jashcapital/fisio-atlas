/**
 * Comparar dos estructuras lado a lado.
 *
 * Estudiando anatomía, la pregunta casi nunca es "qué es esto": es "en qué se
 * diferencia de su vecino". Supraespinoso contra infraespinoso, redondo mayor
 * contra menor, longísimo contra iliocostal. Con una ficha cada vez hay que
 * memorizar las dos y restarlas de cabeza; puestas en columnas, la diferencia
 * se lee.
 *
 * Las dos estructuras se contornean a la vez en el visor con colores distintos,
 * que es la otra mitad de la comparación: dónde está una y dónde la otra.
 */

import { REGION_LABELS, TIPO_LABELS } from "./sidebar.js";

/** Campos comparables, en el orden en que se leen al estudiar. */
const FILAS = [
  { etq: "Nombre latino", val: (e) => e.nombre_la, latin: true },
  { etq: "Tipo", val: (e) => TIPO_LABELS[e.tipo] ?? e.tipo },
  { etq: "Región", val: (e) => REGION_LABELS[e.region] ?? e.region },
  { etq: "Capa", val: (e) => e.capa },
  { etq: "Origen", val: (e) => lista(e.origen, "lugar") },
  { etq: "Inserción", val: (e) => lista(e.insercion, "lugar") },
  { etq: "Inervación", val: (e) => e.inervacion?.nervio },
  { etq: "Raíces", val: (e) => (e.inervacion?.raices ?? []).join(", ") },
  { etq: "Irrigación", val: (e) => e.irrigacion },
  { etq: "Acción", val: (e) => lista(e.accion) },
];

function lista(v, clave) {
  if (!v) return "";
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map((x) => (clave && x && typeof x === "object" ? x[clave] : x))
    .filter(Boolean)
    .join(" · ");
}

export function initComparar({ db, contenedor, onResaltar, onCerrar }) {
  let a = null;
  let b = null;
  let esperando = false;

  /** Empieza una comparación con `entry` como primera estructura. */
  function empezar(entry) {
    a = entry;
    b = null;
    esperando = true;
    render();
  }

  /** Segunda estructura. La llama main.js cuando el usuario elige en el visor. */
  function fijarSegunda(id) {
    if (!esperando) return false;
    const entry = db.getById(id);
    // Comparar algo consigo mismo no dice nada: se ignora y se sigue esperando.
    if (!entry || entry.id === a?.id) return false;
    b = entry;
    esperando = false;
    render();
    onResaltar?.(a.id, b.id);
    return true;
  }

  function cerrar() {
    a = null;
    b = null;
    esperando = false;
    contenedor.hidden = true;
    contenedor.innerHTML = "";
    onResaltar?.(null, null);
    onCerrar?.();
  }

  function render() {
    contenedor.hidden = false;
    if (!b) {
      contenedor.innerHTML = `
        <div class="cmp">
          <header class="cmp__head">
            <span class="cmp__title">Comparar</span>
            <button type="button" class="cmp__close" aria-label="Cancelar la comparación">×</button>
          </header>
          <p class="cmp__espera">
            <span class="cmp__punto cmp__punto--a" aria-hidden="true"></span>
            <strong>${escapeHtml(a.nombre_es)}</strong>
          </p>
          <p class="cmp__ayuda">Elige la segunda estructura en el visor, el buscador o la lista.</p>
        </div>`;
      contenedor.querySelector(".cmp__close").addEventListener("click", cerrar);
      return;
    }

    const filas = FILAS.map((f) => {
      const va = f.val(a) || "";
      const vb = f.val(b) || "";
      if (!va && !vb) return ""; // una fila vacía en las dos columnas es ruido
      // Lo que coincide se marca: en una comparación, lo igual también informa.
      const igual = va && va === vb;
      return `
        <tr${igual ? ' class="is-igual"' : ""}>
          <th scope="row">${escapeHtml(f.etq)}</th>
          <td${f.latin ? ' lang="la"' : ""}>${escapeHtml(va) || "—"}</td>
          <td${f.latin ? ' lang="la"' : ""}>${escapeHtml(vb) || "—"}</td>
        </tr>`;
    }).join("");

    contenedor.innerHTML = `
      <div class="cmp">
        <header class="cmp__head">
          <span class="cmp__title">Comparar</span>
          <button type="button" class="cmp__swap" title="Intercambiar columnas" aria-label="Intercambiar columnas">⇄</button>
          <button type="button" class="cmp__close" aria-label="Cerrar la comparación">×</button>
        </header>
        <div class="cmp__scroll">
          <table class="cmp__tabla">
            <caption class="sr-only">Comparación entre ${escapeHtml(a.nombre_es)} y ${escapeHtml(b.nombre_es)}</caption>
            <thead>
              <tr>
                <td></td>
                <th scope="col"><span class="cmp__punto cmp__punto--a" aria-hidden="true"></span>${escapeHtml(a.nombre_es)}</th>
                <th scope="col"><span class="cmp__punto cmp__punto--b" aria-hidden="true"></span>${escapeHtml(b.nombre_es)}</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </div>`;

    contenedor.querySelector(".cmp__close").addEventListener("click", cerrar);
    contenedor.querySelector(".cmp__swap").addEventListener("click", () => {
      [a, b] = [b, a];
      render();
      onResaltar?.(a.id, b.id);
    });
  }

  return {
    empezar,
    fijarSegunda,
    cerrar,
    esperandoSegunda: () => esperando,
    activo: () => !!a,
  };
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
