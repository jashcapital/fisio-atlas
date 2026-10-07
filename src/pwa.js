/**
 * Registra el service worker (sw.js) para que la app funcione sin conexión, y
 * pide al navegador que no borre lo guardado cuando le falte espacio.
 *
 * Regla de oro: NADA de esto puede romper ni frenar el arranque. Todo va en
 * try/catch, y el registro espera a que la app haya terminado de arrancar:
 *   - la precarga del SW (~20 MB: código + modelos 3D) no compite con la
 *     primera carga por la red del móvil; y como para entonces el navegador ya
 *     tiene esos archivos, el SW los revalida (304) en vez de bajarlos dos veces;
 *   - una versión nueva solo se activa cuando esta página ya cargó todo su
 *     código, así que no puede mezclar archivos de dos versiones (ver sw.js).
 * La página nunca se recarga sola: la versión nueva se ve al volver a abrir.
 *
 * En el árbol fuente (sin `tools/build_dist.mjs`) el SW se registra igual pero
 * no intercepta nada: ver la cabecera de sw.js.
 */

// El SW y su scope se resuelven desde ESTE archivo (src/pwa.js), no desde la
// URL de la página: publicada, la app vive en /fisio-atlas/, no en la raíz.
const URL_SW = new URL("../sw.js", import.meta.url);
const SCOPE = new URL("../", import.meta.url);
const ESPERA_MAX_MS = 120_000; // si el arranque no avisa, se registra igual
const REVISAR_CADA_MS = 6 * 60 * 60 * 1000; // buscar versión nueva en sesiones largas

function arranqueTerminado() {
  // main.js asigna `__fisioAtlas.gpu` al final de boot() (lo mismo que espera
  // el juez); `__bootError` si falló. Se consulta sin tocar main.js.
  const listo = () => (window.__fisioAtlas && window.__fisioAtlas.gpu) || window.__bootError;
  return new Promise((resolver) => {
    const t0 = performance.now();
    const mirar = () => {
      if (listo() || performance.now() - t0 > ESPERA_MAX_MS) resolver();
      else setTimeout(mirar, 500);
    };
    mirar();
  });
}

function activarSiEspera(reg) {
  // Solo si ya hay una versión controlando: la primera instalación se activa
  // sola. Si la nueva llegó durante esta sesión, toma el control ahora (sin
  // recargar); la página sigue con el código que ya tenía en memoria.
  if (reg.waiting && navigator.serviceWorker.controller) {
    reg.waiting.postMessage({ tipo: "activar" });
  }
}

async function registrar() {
  const reg = await navigator.serviceWorker.register(URL_SW.href, { scope: SCOPE.href });
  activarSiEspera(reg);
  reg.addEventListener("updatefound", () => {
    const nuevo = reg.installing;
    nuevo?.addEventListener("statechange", () => {
      if (nuevo.state === "installed") activarSiEspera(reg);
    });
  });
  // Una app instalada en el iPad puede quedarse abierta días: al volver a
  // ella, se mira si hay versión nueva (como mucho cada 6 h).
  let ultima = Date.now();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || Date.now() - ultima < REVISAR_CADA_MS) return;
    ultima = Date.now();
    reg.update().catch(() => {});
  });
}

async function pedirPersistencia() {
  // Sin esto, el navegador puede vaciar la caché (modelos e imágenes) cuando
  // el dispositivo anda corto de espacio, y la app dejaría de abrir sin red.
  if (!navigator.storage?.persist) return;
  if (await navigator.storage.persisted()) return;
  await navigator.storage.persist();
}

async function iniciar() {
  // Los service workers solo existen en contextos seguros: https, o
  // localhost / 127.0.0.1 al probar en el ordenador.
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  await arranqueTerminado();
  try {
    await registrar();
  } catch (err) {
    console.info("[fisio-atlas] sin service worker (la app funciona, pero no sin conexión):", err?.message ?? err);
  }
  try {
    await pedirPersistencia();
  } catch {
    /* sin persistencia: la caché sigue funcionando, solo es borrable */
  }
}

iniciar().catch(() => {});
