/**
 * Favoritos y anotaciones propias, por ficha.
 *
 * El repaso espaciado sabe qué te cuesta, pero no sabe POR QUÉ. Eso solo lo
 * sabe quien estudia: "lo confundo con el redondo menor", "esto lo preguntó
 * en el parcial", "el profe insiste en la inserción". Esa es la anotación.
 *
 * Y el favorito es lo otro que el algoritmo no puede deducir: lo que entra en
 * el examen del viernes.
 *
 * Todo en localStorage, bajo una clave propia:
 *   { [fichaId]: { fav: boolean, nota: string, fecha: "YYYY-MM-DD" } }
 */

const KEY = "fisio-atlas:notas";

function leer() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function escribir(estado) {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
    return true;
  } catch {
    // Cuota llena o almacenamiento bloqueado. Se avisa una sola vez: quien
    // escribe una anotación espera que se guarde, y perderla en silencio es
    // peor que no ofrecer la función.
    if (!escribir.avisado) {
      escribir.avisado = true;
      console.warn("[fisio-atlas] no se pueden guardar notas: almacenamiento no disponible");
    }
    return false;
  }
}

function hoy() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Estado de una ficha. Siempre devuelve objeto, nunca undefined. */
export function obtener(id) {
  const e = leer()[id];
  return { fav: !!e?.fav, nota: e?.nota ?? "", fecha: e?.fecha ?? null };
}

export function esFavorito(id) {
  return obtener(id).fav;
}

/** Alterna el favorito y devuelve el estado nuevo. */
export function alternarFavorito(id) {
  const estado = leer();
  const prev = estado[id] ?? {};
  const fav = !prev.fav;
  // Una ficha sin favorito y sin nota no deja rastro: el almacén solo guarda
  // lo que el usuario ha puesto ahí a propósito.
  if (!fav && !prev.nota) delete estado[id];
  else estado[id] = { ...prev, fav, fecha: hoy() };
  escribir(estado);
  return fav;
}

export function guardarNota(id, texto) {
  const estado = leer();
  const prev = estado[id] ?? {};
  const nota = String(texto ?? "").slice(0, 2000);
  if (!nota && !prev.fav) delete estado[id];
  else estado[id] = { ...prev, nota, fecha: hoy() };
  return escribir(estado);
}

/** Ids marcados como favoritos, los últimos tocados primero. */
export function favoritos() {
  const estado = leer();
  return Object.entries(estado)
    .filter(([, v]) => v.fav)
    .sort((a, b) => String(b[1].fecha ?? "").localeCompare(String(a[1].fecha ?? "")))
    .map(([id]) => id);
}

/** Ids con anotación escrita. */
export function conNota() {
  const estado = leer();
  return Object.entries(estado)
    .filter(([, v]) => v.nota)
    .map(([id]) => id);
}

export function resumen() {
  const estado = leer();
  const vals = Object.values(estado);
  return {
    favoritos: vals.filter((v) => v.fav).length,
    notas: vals.filter((v) => v.nota).length,
  };
}

// Clave de almacenamiento, para exportar e importar «Mis datos» (datos.js).
export { KEY as CLAVE_NOTAS };
