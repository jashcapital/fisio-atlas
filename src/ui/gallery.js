export function renderGallery(imagenes) {
  if (!imagenes?.length) {
    // El aviso anterior era una instrucción para quien mantiene el dataset
    // («añade archivos a assets/images/ y declárarlos en data/», con errata
    // incluida) y lo leía el estudiante en 274 de las 412 fichas.
    return `
      <div class="gallery">
        <div class="gallery__empty">
          Esta ficha todavía no tiene imágenes.
        </div>
      </div>`;
  }

  return `
    <div class="gallery">
      ${imagenes
        .map(
          (img, i) => `
        <figure>
          <button type="button" class="gallery__open" data-idx="${i}" aria-label="Ampliar imagen: ${escapeAttr(img.titulo ?? "imagen anatómica")}">
            <img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.titulo ?? "Imagen anatómica sin título")}" loading="lazy" data-fallback>
          </button>
          <figcaption>
            ${escapeHtml(img.titulo ?? "")}
            ${img.licencia ? `<br><span style="color:var(--text-3);font-size:10px">${escapeHtml(img.licencia)}</span>` : ""}
          </figcaption>
        </figure>`,
        )
        .join("")}
    </div>`;
}

/**
 * Lightbox sobre <sl-dialog>: foco atrapado, Escape y clic en el fondo los
 * gestiona Shoelace. Se abre con el evento global `lightbox:open`.
 */
export function initLightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");

  async function open(data) {
    img.src = data.src;
    img.alt = data.titulo ?? "";
    cap.textContent = [data.titulo, data.licencia].filter(Boolean).join(" · ");
    box.label = data.titulo ?? "Imagen anatómica";
    await customElements.whenDefined("sl-dialog");
    box.show();
  }

  box.addEventListener("sl-after-hide", () => {
    img.src = "";
  });

  window.addEventListener("lightbox:open", (e) => open(e.detail));
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
