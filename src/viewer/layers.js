export const LAYERS = [
  { id: "bone", label: "Huesos", tipo: "bone", default: true },
  {
    id: "muscle-superficial",
    label: "Músc. superficiales",
    tipo: "muscle",
    capa: "superficial",
    default: true,
  },
  {
    id: "muscle-deep",
    label: "Músc. profundos",
    tipo: "muscle",
    capa: "profundo",
    default: true,
  },
  { id: "nerve", label: "Nervios", tipo: "nerve", default: true },
  { id: "ligament", label: "Ligamentos", tipo: "ligament", default: true },
];

export function createLayers(byTipo, db) {
  const state = Object.fromEntries(LAYERS.map((l) => [l.id, l.default]));

  // Build a map from fichaId → capa (so we can filter muscles by layer)
  const fichaCapa = new Map();
  if (db) {
    for (const entry of db.all()) {
      if (entry.tipo === "muscle") {
        fichaCapa.set(entry.id, entry.capa || "superficial");
      }
    }
  }

  // Filtro de Aislar (main.js): si existe, solo se ven las fichas que contiene,
  // y siempre dentro de sus capas. Vive aquí, y no como una foto de `visible`
  // tomada al aislar, porque la foto se desincronizaba: con Aislar activo,
  // tocar cualquier capa volvía a encender TODAS las demás capas encendidas
  // (apply() no sabía del aislamiento, y el botón seguía marcando "aislado"),
  // y al desaislar se restauraba la foto, con lo que la capa recién apagada
  // reaparecía con su botón en "apagado".
  let filtro = null;

  /** Id de la capa a la que pertenece una malla. */
  function capaDe(mesh) {
    const tipo = mesh.userData.tipo;
    if (tipo !== "muscle") return tipo;
    const capa = fichaCapa.get(mesh.userData.fichaId) || "superficial";
    return capa === "profundo" ? "muscle-deep" : "muscle-superficial";
  }

  function apply() {
    const pasa = (mesh) => !filtro || filtro.has(mesh.userData.fichaId);
    // Bones, nerves, ligaments — simple type-based visibility
    for (const tipo of ["bone", "nerve", "ligament"]) {
      const layerState = state[tipo];
      for (const mesh of byTipo[tipo] || []) {
        mesh.visible = layerState && pasa(mesh);
      }
    }
    // Muscles — split by capa
    const superficialOn = state["muscle-superficial"];
    const deepOn = state["muscle-deep"];
    for (const mesh of byTipo.muscle || []) {
      const capa = fichaCapa.get(mesh.userData.fichaId) || "superficial";
      mesh.visible = (capa === "profundo" ? deepOn : superficialOn) && pasa(mesh);
    }
    // El visor dibuja bajo demanda (scene.js): avisar de que la escena cambió.
    window.dispatchEvent(new Event("fisio:render"));
  }

  function toggle(layerId) {
    state[layerId] = !state[layerId];
    apply();
    return state[layerId];
  }

  function isOn(layerId) {
    return state[layerId];
  }

  /** Aislar: `ids` (iterable de fichaId) o null para ver todo lo de las capas encendidas. */
  function setFiltro(ids) {
    filtro = ids ? new Set(ids) : null;
    apply();
  }

  apply();
  return { toggle, isOn, apply, setFiltro, capaDe };
}
