/**
 * Diálogos de ayuda: «Cómo se usa», «Acerca de y créditos» y «Mis datos».
 *
 * Cada módulo registra aquí cómo se abre el suyo, y cualquier botón con
 * `data-abrir="guia|acerca|datos"` (cabecera, menú, la propia ficha, otro
 * diálogo) lo abre sin conocer el módulo. Así un botón de la guía puede llevar
 * a «Mis datos» sin que guia.js importe datos.js.
 *
 * Solo hay uno abierto a la vez: apilar diálogos modales de Shoelace deja el
 * foco atrapado en el de abajo al cerrar el de arriba, y en un teléfono no se
 * ve que debajo queda otro.
 */

const abridores = new Map();

export function registrarDialogo(nombre, abrir) {
  abridores.set(nombre, abrir);
}

export function abrirDialogo(nombre, opciones = {}) {
  abridores.get(nombre)?.(opciones);
}

/** Muestra un <sl-dialog class="dlg">, cerrando antes cualquier otro de ellos. */
export async function mostrar(dialogo) {
  await customElements.whenDefined("sl-dialog");
  const otros = [...document.querySelectorAll("sl-dialog.dlg[open]")].filter((d) => d !== dialogo);
  await Promise.all(otros.map((d) => d.hide()));
  await dialogo.updateComplete;
  if (!dialogo.open) await dialogo.show();
}

/**
 * Delegación de los disparadores. `antes(boton)` deja a main.js cerrar el menú
 * lateral cuando el disparador vive en él: al cerrar el diálogo se vuelve al
 * modelo, no a un menú que ya no se quería.
 */
export function initDisparadores({ antes } = {}) {
  document.addEventListener("click", (e) => {
    const boton = e.target.closest?.("[data-abrir]");
    if (!boton || !abridores.has(boton.dataset.abrir)) return;
    e.preventDefault();
    antes?.(boton);
    abrirDialogo(boton.dataset.abrir, { seccion: boton.dataset.seccion });
  });
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
