/**
 * Continuidad entre sesiones: enlace profundo + historial de estructuras vistas.
 *
 * - El hash de la URL refleja la estructura abierta (`#/e/m.biceps.brachii.long`),
 *   así que el enlace se puede compartir o guardar, y los botones Atrás y
 *   Adelante del navegador recorren lo que has ido mirando.
 * - Las últimas estructuras visitadas quedan en localStorage para volver a
 *   ellas sin buscarlas otra vez.
 */

const KEY_RECENT = "fisio-atlas:recientes";
const MAX_RECENT = 10;
const PREFIX = "#/e/";

/** Id de estructura pedido en la URL al abrir, si lo hay. */
export function idFromHash() {
  const h = location.hash;
  return h.startsWith(PREFIX) ? decodeURIComponent(h.slice(PREFIX.length)) : null;
}

/**
 * Escribe el id en el hash. `replace` evita crear una entrada de historial
 * (se usa al restaurar al abrir, para no dejar un paso "atrás" vacío).
 */
export function writeHash(id, { replace = false } = {}) {
  const target = id ? PREFIX + encodeURIComponent(id) : " ";
  if (location.hash === target) return;
  const url = location.pathname + location.search + (id ? target : "");
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
}

/** Avisa cuando el usuario navega con Atrás/Adelante. */
export function onNavigate(cb) {
  window.addEventListener("popstate", () => cb(idFromHash()));
  window.addEventListener("hashchange", () => cb(idFromHash()));
}

export function recent() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY_RECENT) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Guarda la estructura al principio de la lista, sin repetir. */
export function remember(entry) {
  if (!entry?.id) return recent();
  const list = recent().filter((r) => r.id !== entry.id);
  list.unshift({ id: entry.id, nombre: entry.nombre_es, tipo: entry.tipo, region: entry.region });
  const trimmed = list.slice(0, MAX_RECENT);
  try {
    localStorage.setItem(KEY_RECENT, JSON.stringify(trimmed));
  } catch {
    // cuota llena o almacenamiento bloqueado: el historial es una comodidad,
    // nunca debe impedir que la app funcione
  }
  return trimmed;
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY_RECENT);
  } catch {
    /* nada que hacer */
  }
}

// Clave de almacenamiento, para exportar e importar «Mis datos» (datos.js).
export { KEY_RECENT as CLAVE_RECIENTES };
