/**
 * Repetición espaciada (algoritmo SM-2, el de SuperMemo y Anki).
 *
 * El modo examen aleatorio te pregunta por igual lo que dominas y lo que
 * fallas, que es la forma más lenta de estudiar. Con esto, cada estructura
 * tiene su propio calendario: lo que aciertas se espacia, lo que fallas vuelve
 * al día siguiente.
 *
 * Estado por estructura, en localStorage:
 *   { ease, intervalo (días), repeticiones, vence (fecha ISO corta) }
 */

const KEY = "fisio-atlas:repaso";
const EASE_INICIAL = 2.5;
const EASE_MINIMO = 1.3;

/** Fecha de hoy en formato YYYY-MM-DD, en horario local. */
function hoy() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function sumarDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function cargar() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function guardar(estado) {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    // El repaso es una comodidad: si el almacenamiento falla, el examen debe
    // seguir funcionando igual, solo que sin memoria entre sesiones.
  }
}

/**
 * Registra una respuesta y recalcula el calendario de esa estructura.
 *
 * SM-2 usa una calidad de 0 a 5. Aquí solo hay acierto o fallo, así que se
 * mapean a 4 y a 2: un acierto sin titubeo y un fallo que no llega al umbral
 * de 3, que es el que reinicia la secuencia.
 */
export function revisar(id, acertado) {
  const estado = cargar();
  const prev = estado[id] ?? { ease: EASE_INICIAL, intervalo: 0, repeticiones: 0 };
  const q = acertado ? 4 : 2;

  let { ease, intervalo, repeticiones } = prev;

  // La facilidad se ajusta siempre, también al fallar, y nunca baja de 1,3.
  ease = Math.max(EASE_MINIMO, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // Fallo: vuelve al principio de la escalera y se pregunta mañana.
    repeticiones = 0;
    intervalo = 1;
  } else {
    repeticiones += 1;
    if (repeticiones === 1) intervalo = 1;
    else if (repeticiones === 2) intervalo = 6;
    else intervalo = Math.round(intervalo * ease);
  }

  estado[id] = {
    ease: +ease.toFixed(3),
    intervalo,
    repeticiones,
    vence: sumarDias(intervalo),
    ultima: hoy(),
  };
  guardar(estado);
  return estado[id];
}

/** Ids que tocan hoy o antes, más antiguas primero. */
export function vencidas(ids) {
  const estado = cargar();
  const h = hoy();
  return ids
    .filter((id) => estado[id] && estado[id].vence <= h)
    .sort((a, b) => (estado[a].vence < estado[b].vence ? -1 : 1));
}

/** Ids que nunca se han preguntado. */
export function nuevas(ids) {
  const estado = cargar();
  return ids.filter((id) => !estado[id]);
}

export function estadisticas(ids) {
  const estado = cargar();
  const h = hoy();
  let pendientes = 0;
  let enCurso = 0;
  let consolidadas = 0;
  for (const id of ids) {
    const e = estado[id];
    if (!e) continue;
    if (e.vence <= h) pendientes += 1;
    // 21 días es el umbral habitual para considerar algo asentado en memoria.
    if (e.intervalo >= 21) consolidadas += 1;
    else enCurso += 1;
  }
  return {
    pendientes,
    enCurso,
    consolidadas,
    sinVer: ids.length - Object.keys(estado).filter((id) => ids.includes(id)).length,
    total: ids.length,
  };
}

export function reiniciar() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada que hacer */
  }
}

// Clave de almacenamiento, para exportar e importar «Mis datos» (datos.js).
export { KEY as CLAVE_REPASO };
