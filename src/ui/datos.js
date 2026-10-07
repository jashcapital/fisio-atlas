/**
 * «Mis datos»: exportar e importar lo que la estudiante ha ido guardando.
 *
 * Notas, favoritos, historial, tarjetas de repaso y récord de examen viven
 * solo en el localStorage de su navegador. Eso tiene dos agujeros: cambiar de
 * dispositivo lo deja todo atrás, y Safari en iPhone/iPad borra el
 * almacenamiento de una web que no está en la pantalla de inicio si pasan
 * días sin abrirla. Una copia en un archivo .json es la única red que no
 * necesita servidor ni cuenta.
 *
 * Formato de la copia (versión 1):
 *   { formato: "fisio-atlas-datos", version: 1, app: "Fisio Atlas 1.0",
 *     exportado: ISO 8601, claves: { "fisio-atlas:…": valor } }
 * Las claves conocidas van como objeto (legibles y validables); cualquier otra
 * clave de la app con el prefijo `fisio-atlas:` viaja tal cual, como texto, para
 * que lo que se añada en el futuro también entre en la copia sin tocar esto.
 * No viajan las marcas propias del dispositivo (guía ya vista, fecha de la
 * última copia): no son datos de estudio.
 */
import { CLAVE_NOTAS } from "./notas.js";
import { CLAVE_REPASO } from "./srs.js";
import { CLAVE_RECIENTES } from "./session.js";
import { CLAVE_RECORD } from "./quiz.js";
import { CLAVE_GUIA } from "./guia.js";
import { VERSION, fechaLarga } from "./version.js";
import { registrarDialogo, mostrar, escapeHtml } from "./dialogos.js";

export const FORMATO = "fisio-atlas-datos";
export const VERSION_FORMATO = 1;
const PREFIJO = "fisio-atlas:";
const CLAVE_ULTIMA_COPIA = "fisio-atlas:ultima-copia";
/** Marcas de este dispositivo: ni se exportan ni se borran al reemplazar. */
const LOCALES = new Set([CLAVE_GUIA, CLAVE_ULTIMA_COPIA]);
const MAX_BYTES = 5 * 1024 * 1024; // lo que cabe en el localStorage de cualquier navegador
const MAX_NOTA = 2000; // el mismo tope que el textarea de la ficha
const MAX_RECIENTES = 10;

class ErrorDatos extends Error {}

const esObjeto = (v) => v != null && typeof v === "object" && !Array.isArray(v);
const esFecha = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const esId = (s) => typeof s === "string" && s.length > 0 && s.length <= 200;

// ---- Claves conocidas: cómo se validan y cómo se fusionan ---------------------
// Validar devuelve una copia limpia (o null si el valor no sirve): un archivo
// editado a mano o de otra app no puede meter basura en el almacén.

function validarNotas(v) {
  if (!esObjeto(v)) return null;
  const out = {};
  for (const [id, e] of Object.entries(v)) {
    if (!esId(id) || !esObjeto(e)) continue;
    const fav = e.fav === true;
    const nota = typeof e.nota === "string" ? e.nota.slice(0, MAX_NOTA) : "";
    if (!fav && !nota) continue;
    out[id] = { fav, nota, fecha: esFecha(e.fecha) ? e.fecha : null };
  }
  return out;
}

/** Dos versiones de la misma nota: si una contiene a la otra, la larga; si no, las dos. */
function combinarNota(a, b) {
  if (!a) return b;
  if (!b || a === b || a.includes(b)) return a;
  if (b.includes(a)) return b;
  return `${a}\n\n${b}`.slice(0, MAX_NOTA);
}

function fusionarNotas(local, copia) {
  const out = { ...local };
  for (const [id, e] of Object.entries(copia)) {
    const l = out[id];
    if (!l) {
      out[id] = e;
      continue;
    }
    // Un favorito no se pierde al fusionar: para quitarlos está «Reemplazar».
    out[id] = {
      fav: !!(l.fav || e.fav),
      nota: combinarNota(l.nota ?? "", e.nota ?? ""),
      fecha: [l.fecha, e.fecha].filter(Boolean).sort().pop() ?? null,
    };
  }
  return out;
}

function validarRepaso(v) {
  if (!esObjeto(v)) return null;
  const out = {};
  for (const [id, e] of Object.entries(v)) {
    if (!esId(id) || !esObjeto(e) || !esFecha(e.vence)) continue;
    const ease = Number(e.ease);
    const intervalo = Number(e.intervalo);
    const repeticiones = Number(e.repeticiones);
    if (!Number.isFinite(ease) || ease < 1 || ease > 10) continue;
    if (!Number.isInteger(intervalo) || intervalo < 0) continue;
    if (!Number.isInteger(repeticiones) || repeticiones < 0) continue;
    out[id] = { ease, intervalo, repeticiones, vence: e.vence, ...(esFecha(e.ultima) ? { ultima: e.ultima } : {}) };
  }
  return out;
}

/** Por tarjeta, gana la repasada más recientemente: es la que sabe cómo vas hoy. */
function fusionarRepaso(local, copia) {
  const out = { ...local };
  for (const [id, e] of Object.entries(copia)) {
    const l = out[id];
    if (!l) {
      out[id] = e;
      continue;
    }
    const clave = (t) => `${t.ultima ?? ""}|${t.vence}|${String(t.repeticiones).padStart(4, "0")}`;
    if (clave(e) > clave(l)) out[id] = e;
  }
  return out;
}

function validarRecientes(v) {
  if (!Array.isArray(v)) return null;
  const vistos = new Set();
  const out = [];
  for (const r of v) {
    if (!esObjeto(r) || !esId(r.id) || vistos.has(r.id)) continue;
    vistos.add(r.id);
    out.push({
      id: r.id,
      nombre: typeof r.nombre === "string" ? r.nombre.slice(0, 200) : r.id,
      tipo: typeof r.tipo === "string" ? r.tipo.slice(0, 40) : "",
      region: typeof r.region === "string" ? r.region.slice(0, 40) : "",
    });
  }
  return out.slice(0, MAX_RECIENTES);
}

/** Lo de este dispositivo primero (es lo último que se ha mirado aquí). */
function fusionarRecientes(local, copia) {
  const ids = new Set(local.map((r) => r.id));
  return [...local, ...copia.filter((r) => !ids.has(r.id))].slice(0, MAX_RECIENTES);
}

function validarRecord(v) {
  if (!esObjeto(v)) return null;
  const mejor = Number(v.mejor);
  const respondidas = Number(v.respondidas);
  if (!Number.isFinite(mejor) || mejor < 0 || mejor > 100) return null;
  return { mejor: Math.round(mejor), respondidas: Number.isInteger(respondidas) && respondidas >= 0 ? respondidas : 0 };
}

// Al fusionar se queda el máximo de cada cifra, no la suma: importar dos veces
// la misma copia no puede inflar el récord.
const fusionarRecord = (l, c) => ({ mejor: Math.max(l.mejor, c.mejor), respondidas: Math.max(l.respondidas, c.respondidas) });

const CONOCIDAS = {
  [CLAVE_NOTAS]: { validar: validarNotas, fusionar: fusionarNotas },
  [CLAVE_REPASO]: { validar: validarRepaso, fusionar: fusionarRepaso },
  [CLAVE_RECIENTES]: { validar: validarRecientes, fusionar: fusionarRecientes },
  [CLAVE_RECORD]: { validar: validarRecord, fusionar: fusionarRecord },
};

// ---- Almacén ------------------------------------------------------------------

/** localStorage si se puede escribir en él; null en modo privado estricto o bloqueado. */
function almacen() {
  try {
    const s = window.localStorage;
    const prueba = `${PREFIJO}__prueba`;
    s.setItem(prueba, "1");
    s.removeItem(prueba);
    return s;
  } catch {
    return null;
  }
}

/** Todas las claves de la app que son datos (no marcas del dispositivo). */
export function recogerDatos(s = almacen()) {
  const claves = {};
  if (!s) return claves;
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (!k || !k.startsWith(PREFIJO) || LOCALES.has(k) || k === `${PREFIJO}__prueba`) continue;
    const raw = s.getItem(k);
    if (raw == null) continue;
    const tipo = CONOCIDAS[k];
    if (!tipo) {
      claves[k] = raw;
      continue;
    }
    try {
      const limpio = tipo.validar(JSON.parse(raw));
      if (limpio != null) claves[k] = limpio;
    } catch {
      /* una clave corrupta no impide exportar las demás */
    }
  }
  return claves;
}

/** Cifras legibles de un conjunto de claves (lo de aquí o lo de una copia). */
export function contar(claves) {
  const notas = Object.values(claves[CLAVE_NOTAS] ?? {});
  return {
    notas: notas.filter((n) => n.nota).length,
    favoritos: notas.filter((n) => n.fav).length,
    tarjetas: Object.keys(claves[CLAVE_REPASO] ?? {}).length,
    recientes: (claves[CLAVE_RECIENTES] ?? []).length,
    record: claves[CLAVE_RECORD]?.mejor ?? null,
    otras: Object.keys(claves).filter((k) => !CONOCIDAS[k]).length,
  };
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function fraseCifras(c) {
  const partes = [];
  if (c.notas) partes.push(plural(c.notas, "nota", "notas"));
  if (c.favoritos) partes.push(plural(c.favoritos, "favorito", "favoritos"));
  if (c.tarjetas) partes.push(plural(c.tarjetas, "tarjeta de repaso", "tarjetas de repaso"));
  if (c.recientes) partes.push(plural(c.recientes, "vista reciente", "vistas recientes"));
  if (c.record != null) partes.push(`récord de examen ${c.record} %`);
  if (c.otras) partes.push(plural(c.otras, "ajuste más", "ajustes más"));
  return partes;
}

// ---- Exportar -------------------------------------------------------------------

export function construirCopia() {
  return {
    formato: FORMATO,
    version: VERSION_FORMATO,
    app: `Fisio Atlas ${VERSION}`,
    exportado: new Date().toISOString(),
    claves: recogerDatos(),
  };
}

function hoyLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * En un dispositivo táctil se ofrece la hoja de Compartir del sistema: en
 * iPhone/iPad es donde están «Guardar en Archivos», AirDrop o el correo, y una
 * descarga suelta acaba en una carpeta que nadie encuentra. Chrome no admite
 * compartir .json (canShare lo dice) y entonces se descarga. En escritorio,
 * siempre descarga: la hoja de Compartir de Windows sorprende ahí.
 * Ojo: no puede haber ningún `await` antes de share(), que exige el gesto.
 */
async function exportar() {
  const texto = JSON.stringify(construirCopia(), null, 2);
  const nombre = `fisio-atlas-mis-datos-${hoyLocal()}.json`;
  const blob = new Blob([texto], { type: "application/json" });
  let via = "descarga";
  if (matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function" && typeof File === "function") {
    const archivo = new File([blob], nombre, { type: "application/json" });
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: "Mis datos de Fisio Atlas" });
        via = "compartir";
      } catch (err) {
        if (err?.name === "AbortError") return { cancelado: true };
        // Cualquier otro fallo de la hoja de Compartir: se descarga igual.
      }
    }
  }
  if (via === "descarga") descargar(blob, nombre);
  try {
    localStorage.setItem(CLAVE_ULTIMA_COPIA, new Date().toISOString());
  } catch {
    /* la fecha de la última copia es un recordatorio, no un dato */
  }
  return { nombre, via };
}

// ---- Importar -------------------------------------------------------------------

/** Comprueba una copia ya leída como JSON y devuelve solo lo aprovechable. */
export function validarCopia(json) {
  if (!esObjeto(json) || json.formato !== FORMATO) {
    throw new ErrorDatos("Este archivo no es una copia de «Mis datos» de Fisio Atlas.");
  }
  if (!Number.isInteger(json.version) || json.version < 1 || !esObjeto(json.claves)) {
    throw new ErrorDatos("La copia está incompleta o dañada: no se puede usar.");
  }
  if (json.version > VERSION_FORMATO) {
    throw new ErrorDatos(
      "Esta copia se hizo con una versión más nueva de Fisio Atlas. Recarga la página para actualizarla e inténtalo de nuevo.",
    );
  }
  const claves = {};
  let descartadas = 0;
  for (const [k, v] of Object.entries(json.claves)) {
    if (!k.startsWith(PREFIJO) || LOCALES.has(k) || k.length > 100) {
      descartadas++;
      continue;
    }
    const tipo = CONOCIDAS[k];
    const limpio = tipo ? tipo.validar(v) : typeof v === "string" && v.length <= 1_000_000 ? v : null;
    if (limpio == null) descartadas++;
    else claves[k] = limpio;
  }
  const exportado = typeof json.exportado === "string" && !Number.isNaN(Date.parse(json.exportado)) ? json.exportado : null;
  return { claves, exportado, app: typeof json.app === "string" ? json.app.slice(0, 60) : null, descartadas };
}

async function leerArchivo(archivo) {
  if (archivo.size > MAX_BYTES) throw new ErrorDatos("El archivo es demasiado grande para ser una copia de Fisio Atlas.");
  let texto;
  try {
    texto = await archivo.text();
  } catch {
    throw new ErrorDatos("No se ha podido leer el archivo. Prueba a elegirlo otra vez.");
  }
  let json;
  try {
    json = JSON.parse(texto.replace(/^﻿/, ""));
  } catch {
    throw new ErrorDatos("Este archivo no es una copia de «Mis datos» de Fisio Atlas.");
  }
  return validarCopia(json);
}

/**
 * Escribe la copia. «fusionar» suma lo de la copia a lo de aquí; «reemplazar»
 * deja este dispositivo como estaba en la copia. Si el almacén se llena a
 * medias, se restaura lo que había: un reemplazo que borra y luego no puede
 * escribir dejaría a la estudiante sin nada.
 */
export function aplicarCopia(copia, modo) {
  const s = almacen();
  if (!s) throw new ErrorDatos("Este navegador no deja guardar datos (¿modo privado?). Ábrela en una ventana normal.");
  const actuales = recogerDatos(s);
  const respaldo = {};
  for (const k of Object.keys(actuales)) respaldo[k] = s.getItem(k);

  const escribir = {};
  if (modo === "reemplazar") {
    Object.assign(escribir, copia.claves);
  } else {
    for (const [k, v] of Object.entries(copia.claves)) {
      const tipo = CONOCIDAS[k];
      if (!(k in actuales)) escribir[k] = v;
      else if (tipo) escribir[k] = tipo.fusionar(actuales[k], v);
      // Clave desconocida que ya existe aquí: manda la de este dispositivo.
    }
  }

  try {
    if (modo === "reemplazar") for (const k of Object.keys(actuales)) s.removeItem(k);
    for (const [k, v] of Object.entries(escribir)) {
      s.setItem(k, CONOCIDAS[k] ? JSON.stringify(v) : String(v));
    }
  } catch {
    for (const k of Object.keys(escribir)) {
      try {
        s.removeItem(k);
      } catch {
        /* sigue restaurando el resto */
      }
    }
    for (const [k, v] of Object.entries(respaldo)) {
      try {
        s.setItem(k, v);
      } catch {
        /* sigue restaurando el resto */
      }
    }
    throw new ErrorDatos("No hay espacio para guardar la copia en este navegador. No se ha cambiado nada.");
  }
  // Lo que está a la vista (favoritos, recientes, la ficha abierta) se repinta.
  window.dispatchEvent(new CustomEvent("fisio:datos-cambiados", { detail: { modo } }));
  return contar(recogerDatos(s));
}

// ---- Diálogo ----------------------------------------------------------------------

export function initDatos() {
  const dlg = document.getElementById("dlg-datos");
  if (!dlg) return { abrir: () => {} };
  let pendiente = null; // copia leída y validada, a la espera de que se elija qué hacer

  function fechaCorta(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }

  function estado(texto, tipo = "info") {
    const el = dlg.querySelector(".datos__estado");
    if (!el) return;
    el.dataset.tipo = tipo;
    el.innerHTML = texto;
  }

  function enfocar(sel) {
    const el = dlg.querySelector(sel);
    if (!el) return;
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: false });
  }

  function renderInicio() {
    pendiente = null;
    const disponible = !!almacen();
    const cifras = fraseCifras(contar(recogerDatos()));
    let ultima = null;
    try {
      ultima = fechaCorta(localStorage.getItem(CLAVE_ULTIMA_COPIA));
    } catch {
      /* sin almacén no hay fecha */
    }
    dlg.innerHTML = `
      <div class="dlg__cuerpo datos">
        <p class="dlg__intro">Tus notas, favoritos, historial, tarjetas de repaso y récords se guardan
          <strong>solo en este navegador</strong>. Si cambias de dispositivo, o si el navegador borra los
          datos de la web (Safari puede hacerlo tras unas semanas sin abrirla), se pierden.
          Guarda una copia de vez en cuando.</p>
        ${disponible ? "" : `<p class="dlg__aviso">Este navegador no deja guardar datos (¿estás en una ventana privada?). Ábrela en una ventana normal para conservar tus notas.</p>`}

        <section class="dlg__seccion" aria-labelledby="datos-aqui">
          <h3 id="datos-aqui">En este dispositivo</h3>
          <p class="datos__cifras">${cifras.length ? escapeHtml(cifras.join(" · ")) : "Todavía no has guardado nada: ni notas, ni favoritos, ni repasos."}</p>
          <p class="datos__ultima">${ultima ? `Última copia exportada: ${escapeHtml(ultima)}.` : "Aún no has exportado ninguna copia."}</p>
        </section>

        <section class="dlg__seccion" aria-labelledby="datos-exp">
          <h3 id="datos-exp">Guardar una copia</h3>
          <p>Crea un archivo <code>.json</code> con todo lo anterior. Guárdalo en Archivos, Drive o tu correo.</p>
          <button type="button" class="btn btn--primario" data-exportar ${disponible ? "" : "disabled"}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/></svg>
            Exportar mis datos
          </button>
        </section>

        <section class="dlg__seccion" aria-labelledby="datos-imp">
          <h3 id="datos-imp">Recuperar una copia</h3>
          <p>Elige un archivo exportado antes desde Fisio Atlas. Antes de cambiar nada verás qué contiene.</p>
          <label class="btn btn--secundario datos__elegir">
            <input type="file" accept=".json,application/json" class="sr-only" data-importar ${disponible ? "" : "disabled"} />
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 19h14"/></svg>
            Elegir archivo de copia…
          </label>
        </section>

        <p class="datos__estado" role="status" aria-live="polite"></p>
      </div>`;

    dlg.querySelector("[data-exportar]")?.addEventListener("click", async (e) => {
      const boton = e.currentTarget;
      boton.disabled = true;
      try {
        const r = await exportar();
        if (r.cancelado) {
          estado("No se ha guardado ninguna copia.");
        } else {
          renderInicio();
          estado(
            r.via === "compartir"
              ? "Copia lista. Si la has guardado en Archivos o enviado por correo, ya está a salvo."
              : `Copia descargada: <strong>${escapeHtml(r.nombre)}</strong>. Muévela a un sitio seguro (Drive, correo…).`,
            "ok",
          );
        }
      } catch {
        estado("No se ha podido crear la copia. Inténtalo de nuevo.", "error");
      } finally {
        if (boton.isConnected) boton.disabled = false;
      }
    });

    dlg.querySelector("[data-importar]")?.addEventListener("change", async (e) => {
      const input = e.currentTarget;
      const archivo = input.files?.[0];
      input.value = ""; // elegir el mismo archivo otra vez vuelve a disparar `change`
      if (!archivo) return;
      try {
        pendiente = await leerArchivo(archivo);
        renderVistaPrevia();
      } catch (err) {
        estado(escapeHtml(err instanceof ErrorDatos ? err.message : "No se ha podido leer el archivo."), "error");
      }
    });
  }

  function renderVistaPrevia() {
    const c = contar(pendiente.claves);
    const cifras = fraseCifras(c);
    const fecha = fechaCorta(pendiente.exportado);
    const aqui = fraseCifras(contar(recogerDatos()));
    dlg.innerHTML = `
      <div class="dlg__cuerpo datos">
        <section class="dlg__seccion datos__previa" aria-labelledby="datos-previa">
          <h3 id="datos-previa">Contenido de la copia</h3>
          <p class="datos__origen">${fecha ? `Copia del ${escapeHtml(fecha)}` : "Copia sin fecha"}${pendiente.app ? ` · ${escapeHtml(pendiente.app)}` : ""}</p>
          ${cifras.length ? `<ul class="datos__lista" role="list">${cifras.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : `<p>La copia está vacía: no tiene notas, favoritos ni repasos.</p>`}
          ${pendiente.descartadas ? `<p class="datos__nota">Se ignorarán ${plural(pendiente.descartadas, "elemento que no se reconoce", "elementos que no se reconocen")}.</p>` : ""}
        </section>

        <section class="dlg__seccion" aria-labelledby="datos-que">
          <h3 id="datos-que">¿Qué quieres hacer?</h3>
          <div class="datos__opciones">
            <button type="button" class="btn btn--primario" data-modo="fusionar">Fusionar con lo de este dispositivo</button>
            <p class="datos__explica">Suma lo de la copia a lo que ya tienes. Si una misma nota está en los dos sitios, se conservan las dos versiones.</p>
            <button type="button" class="btn btn--secundario" data-modo="reemplazar">Reemplazar lo de este dispositivo…</button>
            <p class="datos__explica">Borra lo que hay aquí ahora${aqui.length ? ` (${escapeHtml(aqui.join(", "))})` : ""} y deja solo lo de la copia.</p>
          </div>
          <button type="button" class="btn btn--texto" data-cancelar>Cancelar</button>
        </section>

        <p class="datos__estado" role="status" aria-live="polite"></p>
      </div>`;
    dlg.querySelector('[data-modo="fusionar"]').addEventListener("click", () => aplicar("fusionar"));
    dlg.querySelector('[data-modo="reemplazar"]').addEventListener("click", renderConfirmarReemplazo);
    dlg.querySelector("[data-cancelar]").addEventListener("click", () => {
      renderInicio();
      enfocar("#datos-imp");
    });
    enfocar("#datos-previa");
  }

  function renderConfirmarReemplazo() {
    const aqui = fraseCifras(contar(recogerDatos()));
    dlg.innerHTML = `
      <div class="dlg__cuerpo datos">
        <section class="dlg__seccion datos__confirmar" aria-labelledby="datos-conf">
          <h3 id="datos-conf">¿Reemplazar tus datos?</h3>
          <p>Se borrará de este dispositivo ${aqui.length ? `<strong>${escapeHtml(aqui.join(", "))}</strong>` : "lo que haya guardado"} y se quedará solo lo de la copia. No se puede deshacer.</p>
          <p class="datos__explica">Si no estás segura, cancela y exporta antes una copia de lo que tienes ahora.</p>
          <div class="datos__acciones">
            <button type="button" class="btn btn--peligro" data-confirmar>Sí, reemplazar</button>
            <button type="button" class="btn btn--secundario" data-volver>Cancelar</button>
          </div>
        </section>
        <p class="datos__estado" role="status" aria-live="polite"></p>
      </div>`;
    dlg.querySelector("[data-confirmar]").addEventListener("click", () => aplicar("reemplazar"));
    dlg.querySelector("[data-volver]").addEventListener("click", renderVistaPrevia);
    enfocar("#datos-conf");
  }

  function aplicar(modo) {
    try {
      aplicarCopia(pendiente, modo);
      renderInicio();
      estado(
        modo === "reemplazar"
          ? "Listo: este dispositivo tiene ahora los datos de la copia."
          : "Listo: los datos de la copia se han sumado a los tuyos.",
        "ok",
      );
      enfocar(".datos__estado");
    } catch (err) {
      estado(escapeHtml(err instanceof ErrorDatos ? err.message : "No se ha podido importar la copia."), "error");
    }
  }

  async function abrir() {
    renderInicio();
    await mostrar(dlg);
  }

  // Cerrar a medias una importación no deja nada pendiente para la próxima vez.
  dlg.addEventListener("sl-after-hide", (e) => {
    if (e.target === dlg) pendiente = null;
  });

  registrarDialogo("datos", abrir);
  return { abrir };
}
