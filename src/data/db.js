let data = null;
let byId = new Map();
let byMeshId = new Map();
let porRegion = null;

/**
 * Carga todos los datasets declarados en data/index.json y los concatena.
 * El manifiesto es la única fuente de verdad: lo lee también
 * tools/bake_subset.mjs, para que el catálogo de la app y el de los .glb no
 * puedan desincronizarse (un mesh_id catalogado pero no horneado deja la ficha
 * sin resaltado 3D, y el loader ahora lo avisa por consola).
 */
export async function loadDb() {
  const manifest = await fetchJson("data/index.json");
  const files = manifest.datasets.map((d) => d.file);

  const parts = await Promise.all(files.map((f) => fetchJson(`data/${f}`)));

  data = [];
  const seen = new Set();
  parts.forEach((json, i) => {
    for (const e of json.estructuras ?? []) {
      if (seen.has(e.id)) {
        console.warn(`[fisio-atlas] id duplicado entre datasets: ${e.id} (${files[i]}) — se ignora`);
        continue;
      }
      seen.add(e.id);
      data.push(e);
    }
  });

  byId = new Map(data.map((e) => [e.id, e]));
  // El campo es `mesh_ids` (lista); con `e.mesh_id` el mapa tenía una sola
  // clave, `undefined`. Si dos fichas nombran la misma malla gana la última,
  // igual que en loader.js.
  byMeshId = new Map();
  for (const e of data) for (const m of e.mesh_ids ?? []) byMeshId.set(m, e);
  porRegion = null;
  return api;
}

async function fetchJson(url) {
  // Los datasets se editan a mano y hay que verlos al recargar, sin excusas.
  // `cache: "no-cache"` por sí solo no bastaba: seguía sirviéndose el catálogo
  // viejo tras editar un archivo. El parámetro de consulta garantiza una URL
  // distinta en cada carga, así que no hay copia previa que reutilizar.
  // Solo afecta a los JSON (~1,3 MB y locales); los .glb, que son lo pesado,
  // se siguen cacheando con normalidad.
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}t=${Date.now()}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  return res.json();
}

export const api = {
  all: () => data ?? [],
  getById: (id) => byId.get(id),
  getByMeshId: (meshId) => byMeshId.get(meshId),
  // El catálogo no cambia tras `loadDb()`, así que la agrupación se calcula una
  // vez. Hoy solo la pide la barra lateral al arrancar (una llamada), pero el
  // backlog la tenía anotada como "recomputada": memoizada deja de ser una
  // trampa para quien la use en un render. Se devuelven copias de las listas
  // para que nadie pueda reordenar la caché desde fuera.
  byRegion: () => {
    if (!porRegion) {
      porRegion = new Map();
      for (const e of data ?? []) {
        if (!porRegion.has(e.region)) porRegion.set(e.region, []);
        porRegion.get(e.region).push(e);
      }
    }
    return new Map([...porRegion].map(([r, lista]) => [r, [...lista]]));
  },
  /**
   * Find nerve entry by its spanish or latin name (case-insensitive,
   * tolerant of the "(rama…)" parentheticals that appear in inervacion.nervio).
   */
  findNerveByName: (name) => {
    if (!name) return null;
    const clean = name
      .replace(/\s*\(.*?\)\s*/g, " ")
      .toLowerCase()
      .trim();
    return (
      data.find(
        (e) =>
          e.tipo === "nerve" &&
          (clean.includes(e.nombre_es.toLowerCase()) ||
            clean.includes(e.nombre_la.toLowerCase().replace(/^musculus |^nervus /, ""))),
      ) || null
    );
  },
  /** List muscles whose inervacion.nervio references a given nerve entry. */
  musclesInnervatedBy: (nerveEntry) => {
    if (!nerveEntry) return [];
    const needleEs = nerveEntry.nombre_es.toLowerCase();
    const needleLa = nerveEntry.nombre_la.toLowerCase().replace(/^nervus /, "");
    return data.filter((e) => {
      if (e.tipo !== "muscle") return false;
      const src = (e.inervacion?.nervio || "").toLowerCase();
      return src.includes(needleEs) || src.includes(needleLa);
    });
  },
};
