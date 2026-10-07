import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const SOURCES = [
  {
    url: "assets/models/skeletal.glb",
    tipo: "bone",
    color: 0xf5e9c8,
    emissive: 0x1a1510,
    roughness: 0.74,
    metalness: 0.02,
    opacity: 1.0,
  },
  {
    url: "assets/models/muscular.glb",
    tipo: "muscle",
    // Rojo-vino profundo y poco saturado, como en los atlas (no rojo tomate).
    // Sin emisivo: el 0x240705 "encendía" las sombras, aplanaba el volumen y
    // con el entorno PMREM daba plástico rojo de juguete. Más mate (0.62) para
    // un tejido carnoso con brillo húmedo sutil, no lacado.
    color: 0x82362f, // aprobado por el usuario: vino profundo, "un poquito más oscuro" que 0x8f3b33
    emissive: 0x000000,
    roughness: 0.62,
    metalness: 0.0,
    opacity: 1.0,
  },
  {
    url: "assets/models/nervous.glb",
    tipo: "nerve",
    color: 0xf8d968,
    emissive: 0x3a2e00,
    roughness: 0.35,
    metalness: 0.08,
    opacity: 1.0,
  },
  {
    url: "assets/models/joints.glb",
    tipo: "ligament",
    // Lila-gris pálido (tejido fibroso nacarado). El marfil 0xeae4cf anterior
    // era casi el mismo tono que el hueso 0xf5e9c8: no se distinguían, y la
    // leyenda de la barra lateral ya los mostraba en lila.
    color: 0x9aaed0, // = token --ligament de app.css (leyenda y ficha)
    emissive: 0x000000,
    roughness: 0.48,
    metalness: 0.0,
    opacity: 1.0,
  },
];

// Three.js GLTFLoader sanitizes glTF node names via PropertyBinding.sanitizeNodeName:
// - whitespace → underscore
// - remove characters: [ ] . : /
function sanitizeName(name) {
  return String(name).replace(/\s/g, "_").replace(/[\[\].:\/]/g, "");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function loadModel(scene, db, { onProgress } = {}) {
  const root = new THREE.Group();
  root.name = "anatomy-root";
  scene.add(root);

  const index = new Map();
  const byTipo = { bone: [], muscle: [], nerve: [], ligament: [] };
  const pickables = [];

  const results = await Promise.all(SOURCES.map((s) => loadOne(s, onProgress)));

  for (const { src, gltf } of results) {
    const group = gltf.scene;
    group.name = `group-${src.tipo}`;
    root.add(group);

    group.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.userData.tipo = src.tipo;
      obj.userData.baseColor = new THREE.Color(src.color);
      obj.userData.baseOpacity = src.opacity;
      obj.frustumCulled = true;

      const mat = new THREE.MeshStandardMaterial({
        color: src.color,
        emissive: src.emissive,
        roughness: src.roughness,
        metalness: src.metalness,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
        flatShading: false,
      });

      // Ligaments sit on the surface of bones — push them slightly toward
      // the camera with polygon offset to avoid z-fighting when rotating,
      // and give them a higher render order so they draw on top of bones.
      if (src.tipo === "ligament") {
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = -2;
        mat.polygonOffsetUnits = -4;
        obj.renderOrder = 10;
      } else if (src.tipo === "nerve") {
        // Same for nerves — they also sit on the surface of muscles/bones
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = -1;
        mat.polygonOffsetUnits = -2;
        obj.renderOrder = 8;
      }

      obj.material = mat;
      byTipo[src.tipo].push(obj);
    });
  }

  // Build a map from sanitized-name → first matching Object3D in the scene.
  // Z-Anatomy wraps each anatomical entity in a named Group whose descendants
  // are the actual Meshes (often 1-2 primitives with `_1`, `_2` suffixes).
  const objBySanitized = new Map();
  root.traverse((o) => {
    if (o.name && !objBySanitized.has(o.name)) objBySanitized.set(o.name, o);
  });

  // For each ficha, find the named Object3D and collect its direct mesh
  // primitives. We rely on the Group's NAME (already sanitized) for
  // identification — the children can have arbitrary Three.js-dedup names
  // (e.g. left-side Groups can contain children named with '_r_1' suffixes
  // because Three.js shares underlying glTF mesh names between node instances).
  // Only direct-child meshes are collected to exclude nested anatomical
  // landmarks (tubercles, grooves, surfaces).
  // Un mesh_id que no existe en el .glb se ignoraba en silencio: la ficha se
  // abría, la cámara no encuadraba nada y no había ni una pista de por qué.
  // Con cientos de mallas en el catálogo, ese silencio cuesta horas.
  const missing = [];
  // Índice fichaId → mallas, construido una sola vez. Antes cada consulta
  // ("¿qué mallas son de esta ficha?") filtraba las 2136 pickables: el hover lo
  // hacía en cada frame de ratón, `selectById` en cada J/K, y aquí mismo
  // `pickables.includes` y `sinMalla` hacían la carga cuadrática.
  const enPickables = new Set();
  const porFicha = new Map();
  for (const entry of db.all()) {
    const ids = entry.mesh_ids || [];
    for (const id of ids) {
      const key = sanitizeName(id);
      const obj = objBySanitized.get(key);
      if (!obj) {
        missing.push(`${entry.id} → ${id}`);
        continue;
      }
      const meshes = [];
      if (obj.isMesh) meshes.push(obj);
      for (const c of obj.children) {
        if (c.isMesh) meshes.push(c);
      }
      // Y la geometría que Three.js anida un nivel más abajo.
      //
      // Un nodo glTF con malla de VARIAS primitivas se materializa como Group
      // con un Mesh por primitiva. Si además tiene nodos hijos (landmarks,
      // huellas de inserción), esas primitivas caen un nivel más y pasan a ser
      // NIETOS. Con "solo hijos directos" se perdían: medido, el parietal
      // derecho tiene 6 primitivas y 10 416 triángulos, y a la escena llegaba
      // UNA malla de 3456 que ni siquiera era hueso, era la huella del
      // temporal. El cráneo se veía a trozos por esto.
      //
      // Hacen falta LOS DOS criterios, comprobado uno a uno en pantalla:
      //   · Group intermedio sin nombre → recupera el cráneo, pero deja los
      //     huesos largos a trozos.
      //   · Nombre con el prefijo del nodo (`Parietal_boner_3`) → recupera los
      //     huesos largos, pero solo de un lado: Three.js reutiliza los nombres
      //     del lado derecho en el izquierdo cuando comparten malla glTF, y el
      //     izquierdo se quedaba sin recuperar.
      // La unión de ambos cubre el esqueleto entero. Los landmarks (`…t`,
      // `…j`) tienen nombre propio y no casan ninguno de los dos, así que
      // siguen fuera, que es lo que se quiere.
      const yaTengo = new Set(meshes);
      const anadir = (m) => {
        if (m.isMesh && !yaTengo.has(m)) {
          yaTengo.add(m);
          meshes.push(m);
        }
      };
      for (const c of obj.children) {
        if (c.isMesh) continue;
        // Groups estructurales, no anatómicos: el que Three.js crea sin nombre
        // para las primitivas, y los `_instance_N` de los nodos instanciados
        // del glTF. En el fémur derecho la geometría del hueso vive dentro de
        // `_instance_0`; en el izquierdo, dentro de `_instance_1`.
        if (!c.name || c.name.startsWith("_instance")) {
          for (const g of c.children) anadir(g);
        }
      }
      obj.traverse((o) => {
        if (o === obj || !o.isMesh) return;
        if (o.name === key || o.name.startsWith(`${key}_`)) anadir(o);
      });

      for (const mesh of meshes) {
        // Si dos fichas nombraran la misma malla, gana la última (como antes):
        // se retira del índice de la anterior para no contarla dos veces.
        const previa = mesh.userData.fichaId;
        if (previa && previa !== entry.id) {
          const lista = porFicha.get(previa);
          const i = lista ? lista.indexOf(mesh) : -1;
          if (i >= 0) lista.splice(i, 1);
        }
        mesh.userData.fichaId = entry.id;
        mesh.userData.displayName = id;
        if (!enPickables.has(mesh)) {
          enPickables.add(mesh);
          pickables.push(mesh);
        }
        if (!porFicha.has(entry.id)) porFicha.set(entry.id, []);
        const suyas = porFicha.get(entry.id);
        if (!suyas.includes(mesh)) suyas.push(mesh);
      }
      if (!index.has(id)) index.set(id, []);
      for (const mesh of meshes) index.get(id).push(mesh);
    }
  }

  if (missing.length) {
    console.warn(
      `[fisio-atlas] ${missing.length} mesh_ids del catálogo no existen en los .glb ` +
        `— esas fichas se abrirán sin resaltado 3D:`,
      missing,
    );
  }

  for (const [fid, lista] of porFicha) if (!lista.length) porFicha.delete(fid);
  const sinMalla = db.all().filter((e) => !porFicha.has(e.id));
  if (sinMalla.length) {
    console.warn(
      `[fisio-atlas] ${sinMalla.length} fichas sin ninguna malla asociada: ` +
        sinMalla.map((e) => e.id).join(", "),
    );
  }

  // Lo que no está catalogado no se oculta: se saca del grafo.
  //
  // Antes se marcaba `visible = false` y ahí se quedaba. Medido: eran 329
  // mallas —duplicados en nodos `_instance_N` del glTF— con 0,45 de los 3,1
  // millones de triángulos de la escena. Invisibles, pero subidas a la GPU,
  // recorridas en cada `traverse` y candidatas en cada raycast del ratón.
  // Ninguna era una estructura real sin catalogar: el recuento de mallas sin
  // ficha Y visibles era cero.
  const muertas = [];
  for (const tipo of ["bone", "muscle", "nerve", "ligament"]) {
    for (const mesh of byTipo[tipo]) {
      if (!mesh.userData.fichaId) muertas.push(mesh);
    }
  }
  for (const mesh of muertas) mesh.removeFromParent();

  byTipo.bone = byTipo.bone.filter((m) => m.userData.fichaId);
  byTipo.muscle = byTipo.muscle.filter((m) => m.userData.fichaId);
  byTipo.nerve = byTipo.nerve.filter((m) => m.userData.fichaId);
  byTipo.ligament = byTipo.ligament.filter((m) => m.userData.fichaId);

  // `dispose()` solo de lo que ya no referencia nadie. Los nodos instanciados
  // del glTF COMPARTEN geometría con los visibles: liberarla a ciegas dejaría
  // sin malla a una estructura que sí se usa.
  const vivas = new Set();
  root.traverse((o) => {
    if (o.isMesh) {
      vivas.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) vivas.add(m);
    }
  });
  let liberadas = 0;
  let bytes = 0;
  for (const mesh of muertas) {
    if (mesh.geometry && !vivas.has(mesh.geometry)) {
      for (const attr of Object.values(mesh.geometry.attributes)) {
        bytes += attr.array?.byteLength ?? 0;
      }
      bytes += mesh.geometry.index?.array?.byteLength ?? 0;
      mesh.geometry.dispose();
      liberadas++;
    }
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (m && !vivas.has(m)) m.dispose();
    }
  }
  if (muertas.length) {
    // Ojo con lo que este ahorro NO es: estas mallas nunca se renderizaban, así
    // que `renderer.info.memory` no baja — no llegaban a la GPU. Lo que se
    // libera son los buffers en RAM y el recorrido del grafo.
    console.info(
      `[fisio-atlas] ${muertas.length} mallas sin ficha retiradas del grafo: ` +
        `${liberadas} geometrías y ${(bytes / 1048576).toFixed(1)} MiB de buffers liberados.`,
    );
  }

  centerAndScaleFromPickables(pickables, root);

  return { root, index, byTipo, pickables, porFicha, usingPlaceholder: false };
}

// Los .glb están comprimidos con EXT_meshopt_compression (tools/compress_meshopt.mjs),
// que se declara en `extensionsRequired`: sin decoder no degradan, directamente
// no cargan. El módulo lleva el WASM embebido en base64, así que engancharlo no
// cuesta ninguna petición extra.
function loadOne(src, onProgress) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      src.url,
      (gltf) => resolve({ src, gltf }),
      (evt) => onProgress?.(src.url, evt),
      (err) => reject(new Error(`No se pudo cargar ${src.url}: ${err.message || err}`)),
    );
  });
}

function centerAndScaleFromPickables(pickables, root) {
  if (!pickables.length) return;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const m of pickables) {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) continue;
    tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    box.union(tmp);
  }
  if (!isFinite(box.min.x)) return;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxAxis = Math.max(size.x, size.y, size.z);
  if (maxAxis <= 0) return;
  const scale = 3.4 / maxAxis;
  root.scale.setScalar(scale);
  root.position.copy(center).multiplyScalar(-scale);
}
