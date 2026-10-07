/**
 * Sellos de revisión de una ficha: textos y recuento, en un solo sitio.
 *
 * Los leen la ficha (info-panel.js), el estado vacío, «Acerca de» y la guía.
 * Si cada uno tuviera su versión, la explicación del sello acabaría diciendo
 * cosas distintas según dónde se leyera.
 *
 * Por qué «Sin verificar» y no «Pendiente de revisión»: es el contrario literal
 * de «Verificado», así que la pareja se entiende a la primera sin explicación;
 * es lo bastante corto para caber en la fila de metadatos de la ficha a 390 px
 * junto a los códigos TA/FMA y los botones de favorito y comparar; y no promete
 * una revisión con fecha que nadie puede garantizar. El tono lo ponen el
 * estilo (neutro, sin ⚠ ni ámbar de alerta) y la explicación al tocarlo, que
 * dice lo que sí tiene la ficha: fuentes citadas.
 */

export const SELLOS = {
  verificado: {
    clase: "ficha__verified",
    icono: "✓",
    texto: "Verificado",
    explicacion:
      "Cada campo de esta ficha se ha contrastado con sus fuentes, uno por uno, y las afirmaciones clave tienen una cita comprobada en la fuente enlazada.",
  },
  pendiente: {
    clase: "ficha__unverified",
    icono: "○",
    texto: "Sin verificar",
    explicacion:
      "Tiene fuentes citadas, pero aún no se ha revisado campo por campo. Contrástalo con tu bibliografía.",
  },
};

/** Cuántas fichas del catálogo cargado llevan el sello de verificadas. */
export function recuento(db) {
  const todas = db?.all?.() ?? [];
  return {
    verificadas: todas.filter((e) => e.verificado === true).length,
    total: todas.length,
  };
}

/** «67 de 412 fichas verificadas campo por campo», con las cifras en <strong>. */
export function fraseRecuento(db) {
  const { verificadas, total } = recuento(db);
  return `<strong>${verificadas}</strong> de ${total} fichas verificadas campo por campo`;
}
