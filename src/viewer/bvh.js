/**
 * Árboles de volúmenes envolventes (BVH) por geometría, para los rayos.
 *
 * Seleccionar era lo que quedaba de "lag": el encuadre decide desde qué lado
 * se ve la estructura lanzando rayos contra las mallas del resto del cuerpo, y
 * sin aceleración cada rayo prueba triángulo a triángulo todas las mallas que
 * cruza. En las estructuras enterradas (esfenoides, trigémino, etmoides…)
 * eran miles de rayos contra cientos de miles de triángulos: segundos de
 * interfaz congelada, y un tope de tiempo en focus.js que hacía el encuadre
 * no determinista. Con un BVH cada rayo baja por un árbol y solo toca los
 * pocos triángulos que de verdad tiene delante.
 *
 * three-mesh-bvh llega por CDN con un import DINÁMICO: no retrasa el arranque
 * (se descarga en paralelo con los .glb) y si el CDN fallara la app sigue
 * funcionando con los rayos de siempre — `arbolDe()` devuelve null y picker.js
 * y focus.js usan su camino anterior.
 *
 * Los árboles se construyen en modo `indirect`: no reordenan el índice de la
 * geometría (que ya está en la GPU) a cambio de un búfer de 4 bytes por
 * triángulo. Se construyen SOLO en segundo plano, en los ratos libres tras el
 * arranque (requestIdleCallback, respetando su plazo); hasta que una malla
 * tiene su árbol, sus rayos van por el camino sin acelerar.
 *
 * Medido en SwiftShader: 1525 geometrías, 2,8 M triángulos, 2,4 s de CPU en
 * total repartidos en 3,5 s tras el arranque, 30,8 MiB de árboles. La malla
 * más cara, 53 ms (hasta 1,2 s con la máquina saturada por otro proceso).
 * A cambio: selectById sobre las 412 fichas p50 17 ms, p95 179 ms, máx 462
 * ms (antes 237 ms / 2,0 s / 37 s), con el MISMO encuadre en las 412 que la
 * búsqueda completa sin aceleración, y el hover idéntico en 1024 puntos.
 */

let MeshBVH = null;

/** Estadísticas para la consola: window.__fisioAtlas.bvh() */
export const bvhStats = {
  cargado: false,
  construidos: 0,
  triangulos: 0,
  ms: 0,          // tiempo total de construcción
  msMax: 0,       // la construcción más larga (una malla)
  enSegundoPlano: 0,
  sobrepasos: 0,  // construcciones que no cabían en un rato libre (ver abajo)
  listos: false,  // la construcción en segundo plano terminó
  error: null,
};

/** Promesa que se resuelve (nunca se rechaza) cuando la librería está o ha fallado. */
export const bvhListo = import("three-mesh-bvh")
  .then((m) => {
    MeshBVH = m.MeshBVH;
    bvhStats.cargado = true;
  })
  .catch((err) => {
    bvhStats.error = String(err?.message ?? err);
    console.warn("[fisio-atlas] three-mesh-bvh no disponible; los rayos van sin acelerar:", bvhStats.error);
  });

// Conmutador para medir A/B desde la consola (window.__fisioAtlas.usarBVH).
let activo = true;
export function usarBVH(on) {
  activo = !!on;
}

/** ¿Hay aceleración? (la librería ha cargado) */
export function hayBVH() {
  return activo && MeshBVH !== null;
}

// ¿Terminó la construcción en segundo plano? Hasta entonces, las mallas
// sin árbol usan el rayo sin acelerar y focus.js mantiene su tope de tiempo.
let todosListos = false;
export function arbolesListos() {
  return hayBVH() && todosListos;
}

const triangulosDe = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

// Coste estimado de construir, en ms por triángulo (media móvil de lo medido).
// Arranca en 1 µs/triángulo (~1 M triángulos/s, lo medido sin carga).
let msPorTriangulo = 0.001;

function construir(geometry) {
  const t0 = performance.now();
  const arbol = new MeshBVH(geometry, { indirect: true });
  const ms = performance.now() - t0;
  geometry.boundsTree = arbol;
  const n = triangulosDe(geometry);
  bvhStats.construidos++;
  bvhStats.triangulos += n;
  bvhStats.ms += ms;
  if (ms > bvhStats.msMax) bvhStats.msMax = ms;
  if (n > 200) msPorTriangulo = 0.8 * msPorTriangulo + 0.2 * (ms / n);
  return arbol;
}

/**
 * BVH de la geometría si ya está construido; null si no (o sin librería).
 *
 * NUNCA se construye aquí, en medio de un clic o de un movimiento del ratón.
 * La primera versión lo hacía la primera vez que un rayo necesitaba la malla,
 * y justo tras el arranque una sola selección podía construir cientos de
 * árboles seguidos: el juez midió el frontal congelando 3,4 s y tareas largas
 * de hasta 4,6 s. Sin árbol, el rayo va por el camino de siempre (acotado por
 * el tope de focus.js) y el árbol llega en segundo plano.
 */
export function arbolDe(geometry) {
  if (!activo || !MeshBVH) return null;
  return geometry.boundsTree ?? null;
}

/**
 * Construye en segundo plano los árboles que falten, solo cuando el hilo está
 * libre y respetando el plazo de requestIdleCallback: cada malla se construye
 * solo si su coste estimado cabe en el tiempo libre que queda. Una
 * construcción no se puede partir, así que una malla que no cabe se construye
 * sola, al principio de un rato libre casi entero, y cuenta como `sobrepasos`. De la más pequeña a la más grande:
 * casi todo el modelo queda listo en los primeros ratos libres.
 */
export function precalcularArboles(meshes) {
  bvhListo.then(() => {
    if (!MeshBVH) return;
    const pendientes = [...new Set(meshes.map((m) => m.geometry))]
      .filter((g) => !g.boundsTree)
      .sort((a, b) => triangulosDe(a) - triangulosDe(b));
    if (!pendientes.length) {
      todosListos = bvhStats.listos = true;
      return;
    }
    let i = 0;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(() => cb({ timeRemaining: () => 8, didTimeout: false }), 50));
    const turno = (deadline) => {
      let primera = true;
      while (i < pendientes.length) {
        const g = pendientes[i];
        if (g.boundsTree) { i++; continue; }
        const estimado = triangulosDe(g) * msPorTriangulo;
        const libre = deadline.timeRemaining();
        // Cabe en lo que queda del rato libre: se construye. Si no cabe, solo
        // se construye como primera tarea de un rato libre casi entero. Con el
        // bucle de animate() pidiendo frame, los ratos libres duran lo que
        // queda del frame (~16 ms, no 50): esperar a 50 ms dejaba las mallas
        // grandes sin árbol para siempre (medido: sin terminar en 13 min).
        const cabe = estimado < libre - 1;
        if (cabe || (primera && libre >= 12)) {
          construir(g);
          if (!cabe) bvhStats.sobrepasos++;
          bvhStats.enSegundoPlano++;
          i++;
          primera = false;
          continue;
        }
        break;
      }
      if (i < pendientes.length) idle(turno);
      else todosListos = bvhStats.listos = true;
    };
    idle(turno);
  });
}
