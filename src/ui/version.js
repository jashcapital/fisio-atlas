/**
 * Versión visible de Fisio Atlas. Única fuente: la cabecera (`[data-version]`
 * en index.html), «Acerca de» y las copias de «Mis datos» la leen de aquí.
 * Al publicar una versión nueva se cambian estas dos líneas y nada más.
 */
export const VERSION = "1.0";
export const FECHA_VERSION = "2026-10-05";

/** «5 de octubre de 2026», sin depender de la zona horaria del dispositivo. */
export function fechaLarga(iso = FECHA_VERSION) {
  const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  if (!a || !m || !d) return String(iso);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
