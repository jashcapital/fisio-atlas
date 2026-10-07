/**
 * Service worker de Fisio Atlas: la app abre y funciona sin conexión después
 * de la primera visita (modelo 3D incluido).
 *
 * Todas las rutas son RELATIVAS al scope: publicada, la app vive en
 * https://jashcapital.github.io/fisio-atlas/ y no en la raíz del dominio.
 *
 * Qué se guarda y cómo se sirve:
 *   - Esqueleto de la app (index.html, src/, styles/, vendor/, iconos y los
 *     4 .glb): se descarga entero al instalar y se sirve desde la caché
 *     ("caché primero"). Su caché lleva la VERSIÓN = hash del contenido.
 *   - data/*.json: "red primero" (siempre el catálogo más reciente si hay
 *     conexión) con caída a la copia guardada. La app pide cada JSON con
 *     `?t=<Date.now()>`: la clave de caché se guarda SIN la consulta.
 *   - assets/images/**: "caché primero", bajo demanda. No se precargan
 *     (son decenas de MB): se guarda cada imagen la primera vez que se ve.
 *
 * VERSION, VERSION_IMAGENES y PRECACHE los rellena tools/build_dist.mjs en
 * dist/sw.js. Aquí, en el árbol fuente, valen "dev"/null: MODO DESARROLLO,
 * el SW se registra pero NO intercepta ninguna petición (no declara el
 * evento fetch). Así, sirviendo el árbol fuente con `python -m http.server`,
 * nunca se ve un archivo viejo mientras se edita y el juez mide la app sin
 * un intermediario. El uso sin conexión se prueba sobre dist/
 * (`node tools/build_dist.mjs --verificar`).
 *
 * Actualizaciones: el SW nuevo se instala en segundo plano y espera. Solo
 * toma el control cuando src/pwa.js se lo pide, y pwa.js lo hace cuando la
 * página ya terminó de arrancar: para entonces la página tiene TODO su código
 * cargado (imports estáticos; no hay código que se pida más tarde), así que
 * no puede mezclar archivos de dos versiones. La página abierta no se recarga
 * nunca: la versión nueva se ve al volver a abrir la app.
 */
const VERSION = "7bf3aaeef07c";
const VERSION_IMAGENES = "c5787356ee35";
/** @type {Array<[string, string]> | null} [ruta relativa al scope, hash] */
const PRECACHE = [["index.html","8b520beb7226"],["manifest.webmanifest","b4be610edf31"],["assets/icons/apple-touch-icon.png","b8c71cfc4128"],["assets/icons/favicon-32.png","13f69fd9415c"],["assets/icons/icon-192.png","758135245e99"],["assets/icons/icon-512.png","4cdc6eb43096"],["assets/icons/icon-maskable-512.png","740412128955"],["src/data/db.js","9f6b8a4312ca"],["src/main.js","cec861352e29"],["src/pwa.js","dc91489fb7cd"],["src/ui/acerca.js","6c15fe0f402b"],["src/ui/comparar.js","289e86dc8d5f"],["src/ui/datos.js","6b466ff0b66a"],["src/ui/dialogos.js","c50dd5b37c22"],["src/ui/gallery.js","e9b13775fe8f"],["src/ui/guia.js","036ebc1d39e2"],["src/ui/info-panel.js","34a88a1c87f4"],["src/ui/layout.js","03f23d972104"],["src/ui/motion.js","2b56857f5f6e"],["src/ui/notas.js","7a7f0a43ae87"],["src/ui/quiz.js","497b1d7346d9"],["src/ui/search.js","1d7b35f334f8"],["src/ui/sellos.js","22c886362740"],["src/ui/session.js","ea671615c8d6"],["src/ui/sidebar.js","76ce4603aa7b"],["src/ui/srs.js","e7ef9c6843dd"],["src/ui/version.js","d9c6ce86c4a4"],["src/viewer/bvh.js","e36c55b97b83"],["src/viewer/focus.js","bc1ad965ce6a"],["src/viewer/layers.js","89f61ad77464"],["src/viewer/loader.js","4301026f6c7a"],["src/viewer/picker.js","061c4b87fb3e"],["src/viewer/scene.js","f58e66ad317d"],["styles/app.css","2f51648f35e0"],["vendor/LICENSES/@floating-ui__core.txt","0e4c9a9b6c71"],["vendor/LICENSES/@floating-ui__dom.txt","0e4c9a9b6c71"],["vendor/LICENSES/@floating-ui__utils.txt","0e4c9a9b6c71"],["vendor/LICENSES/@lit__reactive-element.txt","45d31799d0db"],["vendor/LICENSES/@shoelace-style__localize.txt","ac9ffacbfc87"],["vendor/LICENSES/@shoelace-style__shoelace.txt","ac9ffacbfc87"],["vendor/LICENSES/LEEME.txt","df34c23dfe18"],["vendor/LICENSES/composed-offset-position.txt","086c588bc8fd"],["vendor/LICENSES/framer-motion.txt","5ff46083b885"],["vendor/LICENSES/fuse.js.txt","cc807e3caa26"],["vendor/LICENSES/lit-element.txt","45d31799d0db"],["vendor/LICENSES/lit-html.txt","2b66f9390afd"],["vendor/LICENSES/lit.txt","45d31799d0db"],["vendor/LICENSES/motion-dom.txt","1bf0dc3f7727"],["vendor/LICENSES/motion-utils.txt","1bf0dc3f7727"],["vendor/LICENSES/motion.txt","1bf0dc3f7727"],["vendor/LICENSES/open-props.txt","fed3aa342094"],["vendor/LICENSES/three-mesh-bvh.txt","b106ef6198a9"],["vendor/LICENSES/three.txt","8b378ebe60e2"],["vendor/floating-ui-dom.mjs","f32ed2a06d66"],["vendor/fonts/OFL-Fraunces.txt","cd3384cafac6"],["vendor/fonts/OFL-IBM-Plex-Mono.txt","23b0a9d0c6d3"],["vendor/fonts/OFL-Instrument-Sans.txt","c27a3c53c3be"],["vendor/fonts/fonts.css","e17a37decd55"],["vendor/fonts/fraunces-latin-ext-opsz-italic.woff2","4983926d3a16"],["vendor/fonts/fraunces-latin-ext-opsz-normal.woff2","a2930b27d13a"],["vendor/fonts/fraunces-latin-opsz-italic.woff2","066710ce7ed2"],["vendor/fonts/fraunces-latin-opsz-normal.woff2","7234ed860a9c"],["vendor/fonts/ibm-plex-mono-latin-400-normal.woff2","08949f728dc5"],["vendor/fonts/ibm-plex-mono-latin-500-normal.woff2","01d285447409"],["vendor/fonts/ibm-plex-mono-latin-ext-400-normal.woff2","6bc0f226a5b7"],["vendor/fonts/ibm-plex-mono-latin-ext-500-normal.woff2","6bb06407c975"],["vendor/fonts/instrument-sans-latin-400-normal.woff2","9a91efaa3599"],["vendor/fonts/instrument-sans-latin-500-normal.woff2","9d3547da16d9"],["vendor/fonts/instrument-sans-latin-600-normal.woff2","efb770916eda"],["vendor/fonts/instrument-sans-latin-ext-400-normal.woff2","a7bedd76b981"],["vendor/fonts/instrument-sans-latin-ext-500-normal.woff2","37de060fbb3d"],["vendor/fonts/instrument-sans-latin-ext-600-normal.woff2","ed2412451550"],["vendor/fuse/fuse.min.mjs","5ab524d12492"],["vendor/motion.mjs","bb5bf18abc34"],["vendor/open-props/open-props.min.css","4bc9bec663eb"],["vendor/shoelace/componentes.json","b389c9279fe3"],["vendor/shoelace/shoelace.mjs","8eab8e53f241"],["vendor/shoelace/themes/dark.css","d28f4e990f84"],["vendor/three-mesh-bvh/index.module.js","102240fa013a"],["vendor/three/build/three.core.js","9edde002b066"],["vendor/three/build/three.module.js","9052042d676c"],["vendor/three/examples/jsm/controls/OrbitControls.js","3d79d07ecb68"],["vendor/three/examples/jsm/environments/RoomEnvironment.js","55f466192cc8"],["vendor/three/examples/jsm/libs/meshopt_decoder.module.js","d428e73a0000"],["vendor/three/examples/jsm/loaders/GLTFLoader.js","131c0f78c01d"],["vendor/three/examples/jsm/postprocessing/EffectComposer.js","4e079a588615"],["vendor/three/examples/jsm/postprocessing/MaskPass.js","7cd08eee9d5d"],["vendor/three/examples/jsm/postprocessing/OutlinePass.js","8eb486b14364"],["vendor/three/examples/jsm/postprocessing/OutputPass.js","02e4a261af34"],["vendor/three/examples/jsm/postprocessing/Pass.js","444b409c235e"],["vendor/three/examples/jsm/postprocessing/RenderPass.js","817f6c3cdcd0"],["vendor/three/examples/jsm/postprocessing/ShaderPass.js","e2500a5913b2"],["vendor/three/examples/jsm/shaders/CopyShader.js","a33057d5ac91"],["vendor/three/examples/jsm/shaders/FXAAShader.js","b8303d179f9d"],["vendor/three/examples/jsm/shaders/OutputShader.js","353479f77a8d"],["vendor/three/examples/jsm/utils/BufferGeometryUtils.js","9fb63427ce66"],["vendor/three/examples/jsm/utils/SkeletonUtils.js","b1632a703206"],["data/head.json","9f826a29054c"],["data/index.json","95ccb5764e7c"],["data/leg-foot.json","1b8f680478a3"],["data/lower-limb.json","5dd0b675a499"],["data/sinonimos.json","cf6fce152d86"],["data/upper-limb.json","9ba62748bb38"],["assets/models/joints.glb","102cabbc5528"],["assets/models/muscular.glb","14a95725910c"],["assets/models/nervous.glb","bb769286a372"],["assets/models/skeletal.glb","36e392f37cee"]];

const DESARROLLO = PRECACHE === null;
const SCOPE = self.registration.scope; // termina en "/"
const RUTA_SCOPE = new URL(SCOPE).pathname;
// Cache Storage es del ORIGEN, no del scope: en jashcapital.github.io lo
// comparten todas las páginas de la cuenta. El prefijo con la ruta del scope
// evita borrar (o leer) las cachés de otra app del mismo dominio.
const PREFIJO = `fisio-atlas:${RUTA_SCOPE}:`;
const CACHE_SHELL = `${PREFIJO}shell-${VERSION}`;
const CACHE_DATOS = `${PREFIJO}datos`;
const CACHE_IMAGENES = `${PREFIJO}imagenes-${VERSION_IMAGENES}`;
const CABECERA_REV = "X-Fisio-Rev";

const EN_SHELL = new Map((PRECACHE ?? []).map(([ruta, rev]) => [ruta, rev]));
const urlDe = (ruta) => new URL(ruta, SCOPE).href;
const esDatos = (ruta) => ruta.startsWith("data/") && ruta.endsWith(".json");

// ── Instalación: precarga del esqueleto ─────────────────────────────────────
self.addEventListener("install", (ev) => {
  ev.waitUntil(precargar());
});

async function precargar() {
  if (DESARROLLO) return;
  const shell = await caches.open(CACHE_SHELL);
  const datos = await caches.open(CACHE_DATOS);
  const viejas = (await caches.keys()).filter((n) => n.startsWith(`${PREFIJO}shell-`) && n !== CACHE_SHELL);
  // Si algo falla (se cae la conexión a mitad), la promesa se rechaza, este
  // SW no se instala y el navegador lo reintenta en la próxima visita,
  // aprovechando lo ya bajado. La caché a medias no se sirve nunca: solo la
  // usa un SW activo, y la borra la activación de cualquier otra versión.
  await enLotes([...EN_SHELL], 6, async ([ruta, rev]) => {
    const url = urlDe(ruta);
    if (esDatos(ruta)) {
      await datos.put(url, await descargar(url));
      return;
    }
    // Lo que no cambió desde la versión anterior se copia de su caché en vez
    // de bajarlo otra vez: sin esto, cada actualización del código volvería a
    // descargar los ~15 MB de modelos 3D por la red móvil. (Se mira también
    // la caché propia: el reintento de una instalación fallida no repite lo
    // que ya bajó.)
    for (const n of [CACHE_SHELL, ...viejas]) {
      const previa = await (await caches.open(n)).match(url);
      if (previa && previa.headers.get(CABECERA_REV) === rev) {
        if (n !== CACHE_SHELL) await shell.put(url, previa);
        return;
      }
    }
    await shell.put(url, await conRevision(await descargar(url), rev));
  });
}

// `no-cache`: revalida contra el servidor (un 304 no vuelve a bajar el
// archivo) en vez de fiarse de la caché HTTP, que en GitHub Pages puede
// tener hasta 10 minutos de antigüedad y mezclaría versiones.
async function descargar(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`precarga ${url}: HTTP ${r.status}`);
  return limpiar(r);
}

async function conRevision(resp, rev) {
  const h = new Headers(resp.headers);
  h.set(CABECERA_REV, rev);
  return new Response(await resp.blob(), { status: resp.status, statusText: resp.statusText, headers: h });
}

// Una respuesta que llegó tras una redirección no puede usarse para servir
// una navegación: se copia a una respuesta "limpia".
async function limpiar(resp) {
  if (!resp.redirected) return resp;
  return new Response(await resp.blob(), { status: resp.status, statusText: resp.statusText, headers: resp.headers });
}

async function enLotes(lista, n, fn) {
  let i = 0;
  const trabajador = async () => {
    while (i < lista.length) await fn(lista[i++]);
  };
  await Promise.all(Array.from({ length: Math.min(n, lista.length) }, trabajador));
}

// ── Activación: limpieza de versiones viejas ────────────────────────────────
self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    (async () => {
      const vivas = new Set([CACHE_SHELL, CACHE_DATOS, CACHE_IMAGENES]);
      for (const n of await caches.keys()) {
        if (n.startsWith(PREFIJO) && !vivas.has(n)) await caches.delete(n);
      }
      await self.clients.claim();
    })(),
  );
});

// pwa.js lo pide cuando la página terminó de arrancar (ver cabecera).
self.addEventListener("message", (ev) => {
  if (ev.data?.tipo === "activar") self.skipWaiting();
});

// ── Peticiones ──────────────────────────────────────────────────────────────
// Solo en la versión construida (ver cabecera). Sin manejador de fetch, el
// navegador ni siquiera despierta al SW para cada petición.
if (!DESARROLLO) self.addEventListener("fetch", alPedir);

function alPedir(ev) {
  const req = ev.request;
  if (req.method !== "GET" || !req.url.startsWith(SCOPE)) return;
  const url = new URL(req.url);
  let ruta;
  try {
    ruta = decodeURIComponent(url.pathname.slice(RUTA_SCOPE.length));
  } catch {
    return;
  }

  if (req.mode === "navigate") {
    // Solo la portada: cualquier otra navegación (no la hay en la app) va a
    // la red tal cual. La ruta de la app vive en el #hash, que no llega aquí.
    if (ruta === "" || ruta === "index.html") ev.respondWith(portada(req));
    return;
  }
  if (esDatos(ruta)) {
    ev.respondWith(redPrimero(req, urlDe(ruta)));
    return;
  }
  if (ruta.startsWith("assets/images/")) {
    ev.respondWith(imagen(req));
    return;
  }
  if (EN_SHELL.has(ruta)) ev.respondWith(cachePrimero(req, urlDe(ruta)));
  // Lo demás (un archivo que no es de la app) no se toca: va a la red.
}

function portada(req) {
  return cachePrimero(req, urlDe("index.html"));
}

async function cachePrimero(req, clave) {
  const guardada = await caches.match(clave, { cacheName: CACHE_SHELL });
  return guardada ?? fetch(req);
}

// data/*.json: la red primero. Con una red muy lenta (el wifi de la facultad
// que "conecta" pero no carga) no se espera indefinidamente: a los 4 s se
// sirve la copia guardada, y la red, si acaba respondiendo, la actualiza.
async function redPrimero(req, clave) {
  const cache = await caches.open(CACHE_DATOS);
  const red = fetch(req).then(async (r) => {
    if (r.ok) await cache.put(clave, r.clone());
    return r;
  });
  const guardada = await cache.match(clave);
  if (!guardada) return red;
  return new Promise((resolver) => {
    const plazo = setTimeout(() => resolver(guardada), 4000);
    red.then(
      (r) => {
        clearTimeout(plazo);
        resolver(r.ok ? r : guardada);
      },
      () => {
        clearTimeout(plazo);
        resolver(guardada);
      },
    );
  });
}

async function imagen(req) {
  const cache = await caches.open(CACHE_IMAGENES);
  const guardada = await cache.match(req, { ignoreSearch: true });
  if (guardada) return guardada;
  const r = await fetch(req);
  if (r.ok && r.type === "basic") await cache.put(req.url.split("?")[0], r.clone());
  return r;
}
