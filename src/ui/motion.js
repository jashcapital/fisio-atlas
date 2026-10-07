// Animaciones de la interfaz sobre Motion One (motion.dev).
// Sustituye los @keyframes escalonados a mano que vivían en interactions.css:
// todo lo que "cobra vida" pasa por aquí, con una sola curva y una sola escala.
import { animate, stagger } from "motion";

const EASE = [0.22, 0.61, 0.36, 1];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** La ficha entera entra, y sus secciones se escalonan detrás. */
export function enterFicha(root) {
  if (!root || reduced()) return;
  animate(root, { opacity: [0, 1], y: [10, 0] }, { duration: 0.36, ease: EASE });

  const sections = root.querySelectorAll(
    "sl-tab-panel[active] .ficha__section, sl-tab-panel[active] .fisio-test",
  );
  if (sections.length) {
    animate(
      sections,
      { opacity: [0, 1], y: [8, 0] },
      { duration: 0.34, ease: EASE, delay: stagger(0.05, { startDelay: 0.04 }) },
    );
  }
}

/** Al cambiar de pestaña, solo se anima el panel recién mostrado. */
export function enterTabPanel(panel) {
  if (!panel || reduced()) return;
  const items = panel.querySelectorAll(".ficha__section, .fisio-test, .gallery figure");
  if (!items.length) return;
  animate(
    items,
    { opacity: [0, 1], y: [6, 0] },
    { duration: 0.28, ease: EASE, delay: stagger(0.04) },
  );
}

/** Entrada suave de la lista desplegada de una región. */
export function enterList(items) {
  if (!items?.length || reduced()) return;
  animate(items, { opacity: [0, 1], x: [-6, 0] }, { duration: 0.24, ease: EASE, delay: stagger(0.025) });
}

/** Anillo que se expande en el punto de clic sobre el visor. */
export function ripple(container, x, y) {
  if (reduced()) return;
  const ring = document.createElement("span");
  Object.assign(ring.style, {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: "80px",
    height: "80px",
    marginLeft: "-40px",
    marginTop: "-40px",
    borderRadius: "50%",
    border: "1.5px solid var(--accent)",
    pointerEvents: "none",
    zIndex: 15,
  });
  container.appendChild(ring);
  animate(
    ring,
    { scale: [0, 1], opacity: [1, 0] },
    { duration: 0.55, ease: [0.2, 0.7, 0.3, 1] },
  ).then(() => ring.remove());
}

/** Micro-feedback de pulsación para controles del visor. */
export function press(el) {
  if (!el || reduced()) return;
  animate(el, { scale: [1, 0.94, 1] }, { duration: 0.22, ease: EASE });
}
