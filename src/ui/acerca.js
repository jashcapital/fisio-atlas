/**
 * «Acerca de y créditos»: qué es la app, qué significan los sellos y de quién
 * es cada pieza de terceros.
 *
 * Cada licencia se ha comprobado contra su texto real el 05-10-2026, no de
 * memoria:
 *  · Z-Anatomy: LICENSE de moueza/Z-Anatomy = CC BY-SA 4.0. Ese LICENSE remite
 *    a su documento de licencias, que pide atribuir el modelo humano a
 *    «BodyParts3D – The Database Center for Life Science – CC-BY 4.0» y a
 *    «Z-Anatomy – CC-BY-SA 4.0», y enumera además unos modelos de referencia.
 *  · BodyParts3D: su página de licencia (LSDB Archive) pide literalmente
 *    «BodyParts3D, © The Database Center for Life Science licensed under CC
 *    Attribution 4.0 International».
 *  · three.js, three-mesh-bvh, Shoelace, Motion, Floating UI, Open Props y
 *    meshoptimizer: MIT (LICENSE de cada paquete en la versión que se usa).
 *  · Fuse.js: Apache 2.0.
 *  · Fraunces, Instrument Sans e IBM Plex Mono: SIL Open Font License 1.1
 *    (OFL.txt de cada familia en google/fonts).
 * No se nombra a personas: los avisos de copyright completos están en los
 * textos de licencia enlazados.
 */
import { registrarDialogo, mostrar, escapeHtml } from "./dialogos.js";
import { SELLOS, recuento } from "./sellos.js";
import { VERSION, FECHA_VERSION, fechaLarga } from "./version.js";

const enlace = (href, texto) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(texto)}<span class="sr-only"> (se abre en otra pestaña)</span></a>`;

const LIBRERIAS = [
  { nombre: "three.js", uso: "dibuja el modelo 3D", web: "https://threejs.org/", lic: "MIT", licUrl: "https://github.com/mrdoob/three.js/blob/dev/LICENSE" },
  { nombre: "three-mesh-bvh", uso: "acelera la selección al tocar", web: "https://github.com/gkjohnson/three-mesh-bvh", lic: "MIT", licUrl: "https://github.com/gkjohnson/three-mesh-bvh/blob/master/LICENSE" },
  { nombre: "meshoptimizer", uso: "descomprime los modelos (incluido con three.js)", web: "https://github.com/zeux/meshoptimizer", lic: "MIT", licUrl: "https://github.com/zeux/meshoptimizer/blob/master/LICENSE.md" },
  { nombre: "Fuse.js", uso: "el buscador", web: "https://www.fusejs.io/", lic: "Apache 2.0", licUrl: "https://github.com/krisk/Fuse/blob/main/LICENSE" },
  { nombre: "Shoelace", uso: "pestañas, menús y ventanas", web: "https://shoelace.style/", lic: "MIT", licUrl: "https://github.com/shoelace-style/shoelace/blob/next/LICENSE.md" },
  { nombre: "Motion", uso: "animaciones", web: "https://motion.dev/", lic: "MIT", licUrl: "https://github.com/motiondivision/motion/blob/main/LICENSE.md" },
  { nombre: "Floating UI", uso: "coloca la etiqueta flotante", web: "https://floating-ui.com/", lic: "MIT", licUrl: "https://github.com/floating-ui/floating-ui/blob/master/LICENSE" },
  { nombre: "Open Props", uso: "variables de diseño", web: "https://open-props.style/", lic: "MIT", licUrl: "https://github.com/argyleink/open-props/blob/main/LICENSE" },
];

const FUENTES = [
  { nombre: "Fraunces", web: "https://github.com/undercasetype/Fraunces" },
  { nombre: "Instrument Sans", web: "https://github.com/Instrument/instrument-sans" },
  { nombre: "IBM Plex Mono", web: "https://github.com/IBM/plex" },
];

/** Imágenes de las galerías: cuántas hay y cuántas son de dominio público. */
function cifrasImagenes(db) {
  const imgs = (db?.all?.() ?? []).flatMap((e) => e.imagenes ?? []);
  return {
    total: imgs.length,
    dominioPublico: imgs.filter((i) => /^dominio público/i.test(i.licencia ?? "")).length,
  };
}

function contenido(db) {
  const { verificadas, total } = recuento(db);
  const pct = total ? Math.round((verificadas / total) * 100) : 0;
  const img = cifrasImagenes(db);
  const v = SELLOS.verificado;
  const p = SELLOS.pendiente;
  return `
    <div class="dlg__cuerpo acerca">
      <section class="dlg__seccion">
        <p class="dlg__intro"><b>Fisio Atlas</b> es un atlas anatómico en 3D para estudiar fisioterapia:
          músculos, huesos, nervios y ligamentos del cuerpo completo, con su origen, inserción, inervación,
          acción, pruebas clínicas e imágenes.</p>
        <p class="dlg__aviso"><b>Es una herramienta de estudio.</b> No sustituye a tu bibliografía ni al
          criterio clínico. Si algo no cuadra con tus libros o con lo que te enseñan, manda la bibliografía.</p>
        <div class="dlg__botones">
          <button type="button" class="btn btn--secundario" data-abrir="guia">Cómo se usa</button>
          <button type="button" class="btn btn--secundario" data-abrir="datos">Mis datos: exportar o importar</button>
        </div>
      </section>

      <section class="dlg__seccion" id="acerca-sellos" aria-labelledby="acerca-sellos-t">
        <h3 id="acerca-sellos-t">Estado de la revisión</h3>
        <p><strong>${verificadas} de ${total}</strong> fichas están verificadas campo por campo (${pct} %).</p>
        <div class="acerca__barra" role="img" aria-label="${verificadas} de ${total} fichas verificadas">
          <span style="inline-size:${pct}%"></span>
        </div>
        <dl class="acerca__sellos">
          <dt><span class="ficha__sello-muestra ${v.clase}">${v.icono} ${v.texto}</span></dt>
          <dd>${v.explicacion}</dd>
          <dt><span class="ficha__sello-muestra ${p.clase}">${p.icono} ${p.texto}</span></dt>
          <dd>${p.explicacion}</dd>
        </dl>
        <p class="acerca__nota">En las dos, las fuentes de cada dato están enlazadas junto a él en la ficha.</p>
      </section>

      <section class="dlg__seccion" aria-labelledby="acerca-creditos">
        <h3 id="acerca-creditos">Créditos y licencias</h3>

        <h4>Modelos 3D</h4>
        <p>Proceden de ${enlace("https://github.com/moueza/Z-Anatomy", "Z-Anatomy")}, con licencia
          ${enlace("https://creativecommons.org/licenses/by-sa/4.0/deed.es", "CC BY-SA 4.0")}
          (${enlace("https://github.com/moueza/Z-Anatomy/blob/main/LICENSE", "texto de la licencia")}).
          Los de esta app son una adaptación —recortados a las estructuras del atlas y comprimidos— y se
          comparten con la misma licencia.</p>
        <p>Z-Anatomy se basa en ${enlace("https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html", "BodyParts3D")},
          © The Database Center for Life Science, con licencia
          ${enlace("https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html", "CC Attribution 4.0 International")}.
          Su ${enlace("https://docs.google.com/document/d/1peWW_7IiVgTTAwcI_auv38YSJ6qGWRuTMxzzhkRpXIk/edit", "documento de licencias")}
          enumera además los modelos que usó como referencia.</p>

        <h4>Imágenes</h4>
        <p>Las ${img.total} imágenes de las galerías proceden de ${enlace("https://commons.wikimedia.org/", "Wikimedia Commons")}.
          Cada una indica debajo su autor y su licencia. ${img.dominioPublico} son de dominio público, sobre todo láminas de
          ${enlace("https://commons.wikimedia.org/wiki/Category:Gray%27s_Anatomy_plates", "Gray's Anatomy (edición de 1918)")};
          muchas otras son de Anatomography (BodyParts3D) con licencia CC BY-SA 2.1 Japón, y el resto, CC BY-SA, CC BY o CC0.</p>

        <h4>Programas</h4>
        <ul class="acerca__lista" role="list">
          ${LIBRERIAS.map(
            (l) => `<li><span>${enlace(l.web, l.nombre)} <span class="acerca__uso">— ${escapeHtml(l.uso)}</span></span>${enlace(l.licUrl, l.lic)}</li>`,
          ).join("")}
        </ul>

        <h4>Tipografías</h4>
        <ul class="acerca__lista" role="list">
          ${FUENTES.map(
            (f) => `<li><span>${enlace(f.web, f.nombre)}</span>${enlace("https://openfontlicense.org/", "SIL OFL 1.1")}</li>`,
          ).join("")}
        </ul>
        <p class="acerca__nota">Los avisos de copyright completos están en el texto de cada licencia.</p>
      </section>

      <p class="acerca__version">Versión ${escapeHtml(VERSION)} · ${escapeHtml(fechaLarga(FECHA_VERSION))}</p>
    </div>`;
}

export function initAcerca({ db } = {}) {
  // La cabecera repite la versión: se escribe desde aquí para que haya una sola fuente.
  document.querySelectorAll("[data-version]").forEach((el) => {
    el.textContent = `v${VERSION}`;
  });

  const dlg = document.getElementById("dlg-acerca");
  if (!dlg) return { abrir: () => {} };
  let pintado = false;

  async function abrir({ seccion } = {}) {
    if (!pintado) {
      dlg.innerHTML = contenido(db);
      pintado = true;
    }
    await mostrar(dlg);
    // «Más sobre los sellos» desde una ficha: se lleva la vista a esa sección.
    const destino = seccion ? dlg.querySelector(`#acerca-${CSS.escape(seccion)}`) : null;
    if (destino) destino.scrollIntoView({ block: "start" });
    else {
      const cuerpo = dlg.shadowRoot?.querySelector('[part~="body"]');
      if (cuerpo) cuerpo.scrollTop = 0;
    }
  }

  registrarDialogo("acerca", abrir);
  return { abrir };
}
