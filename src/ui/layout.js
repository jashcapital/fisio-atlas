/**
 * Layout responsive.
 * Por encima de 1024px los paneles flotan sobre el escenario; por debajo se
 * trasladan a <sl-drawer> (Shoelace) y se abren desde los botones de la
 * cabecera. Solo se mueve el nodo — sus listeners viajan con él.
 */
export function initLayout() {
  const mq = matchMedia("(max-width: 1023px)");
  // En un teléfono, un panel lateral deja la ficha en una columna demasiado
  // estrecha para leer: entra como hoja inferior.
  const mqPhone = matchMedia("(max-width: 640px)");
  const root = document.documentElement;
  const main = document.querySelector(".app-body");
  const sidebar = document.getElementById("sidebar");
  const info = document.getElementById("info-panel");
  const drawerNav = document.getElementById("drawer-nav");
  const drawerInfo = document.getElementById("drawer-info");

  // Idempotente: solo mueve nodos cuando el modo cambia de verdad, para poder
  // llamarlo en cada `resize` sin coste.
  let modoActual = null;
  function apply(compact) {
    if (modoActual === compact) return;
    modoActual = compact;
    root.dataset.layout = compact ? "compact" : "full";
    if (compact) {
      drawerNav.append(sidebar);
      drawerInfo.append(info);
    } else {
      drawerNav.hide?.();
      drawerInfo.hide?.();
      main.prepend(sidebar);
      main.append(info);
    }
  }

  function applyPlacement(phone) {
    drawerInfo.placement = phone ? "bottom" : "end";
  }

  function sincronizar() {
    apply(mq.matches);
    applyPlacement(mqPhone.matches);
  }

  sincronizar();
  // Al arrancar, matchMedia puede no reflejar todavía el ancho definitivo (el
  // viewport se termina de aplicar después de ejecutar el script, y ese ajuste
  // no siempre emite `resize`). Se vuelve a comprobar tras el primer pintado.
  requestAnimationFrame(() => requestAnimationFrame(sincronizar));
  setTimeout(sincronizar, 300);

  mq.addEventListener("change", sincronizar);
  mqPhone.addEventListener("change", sincronizar);
  // Red de seguridad. `matchMedia` y `resize` pueden no llegar a tiempo o no
  // llegar en absoluto (emulación de viewport, giro del teléfono, ventana
  // redimensionada mientras arranca), y entonces el layout se queda en el modo
  // equivocado para siempre: los paneles fuera del drawer, o al revés.
  // Un ResizeObserver sobre el documento observa el tamaño REAL y no depende
  // de que nadie emita un evento.
  window.addEventListener("resize", sincronizar, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(sincronizar).observe(document.documentElement);
  }

  // Transición en curso de cada drawer (apertura o cierre), para no pisarla.
  //
  // Shoelace anima el cierre y, al terminar la animación, marca el panel como
  // oculto. Si se reabre mientras esa animación sigue viva, `show()` cancela
  // la animación… y la continuación del cierre se ejecuta DESPUÉS de la
  // apertura: queda `open=true` con el panel oculto, una hoja de ficha que ya
  // no aparece aunque se toque otra estructura. En el teléfono bastaba con
  // cerrar la hoja y tocar enseguida otra cosa. Abrir y cerrar esperan a que
  // acabe la transición anterior; y al terminar cada una se reconcilia el
  // estado (ver `terminar`). Medido forzando la carrera (cerrar y reabrir al
  // instante, 12 ciclos): antes 5 hojas atascadas para siempre, ahora 0.
  const transicion = new WeakMap();
  for (const d of [drawerNav, drawerInfo]) {
    let fin = null;
    const empezar = () => {
      transicion.set(d, new Promise((r) => (fin = r)));
    };
    const terminar = () => {
      fin?.();
      transicion.delete(d);
      // Red de seguridad para lo que no pasa por show()/hide() de aquí (la × y
      // Escape los gestiona Shoelace por dentro) o cuando la espera de arriba
      // se agota: al acabar cada transición se comprueba que lo que se ve
      // coincide con `open`, y si no, se completa el movimiento que quedó a
      // medias. Sin esto, forzando la carrera seguían 5 de 12 hojas atascadas
      // (abiertas e invisibles); con esto, 0.
      setTimeout(() => {
        const base = d.shadowRoot?.querySelector('[part~="base"]');
        if (!base || transicion.has(d)) return;
        if (d.open && base.hidden) {
          d.open = false;
          d.updateComplete.then(() => d.show());
        } else if (!d.open && !base.hidden) {
          d.open = true;
          d.updateComplete.then(() => d.hide());
        }
      }, 0);
    };
    d.addEventListener("sl-show", empezar);
    d.addEventListener("sl-hide", empezar);
    d.addEventListener("sl-after-show", terminar);
    d.addEventListener("sl-after-hide", terminar);
  }
  // Una transición que nunca emite su evento final no debe bloquear para
  // siempre: se espera como mucho 4 s (sin GPU, la animación de 250 ms
  // llega a durar segundos de reloj).
  const esperarTransicion = (d) =>
    Promise.race([transicion.get(d), new Promise((r) => setTimeout(r, 4000))]);

  async function show(drawer) {
    sincronizar(); // el panel debe estar dentro del drawer antes de abrirlo
    await customElements.whenDefined("sl-drawer");
    // `whenDefined` resuelve antes del primer render de Lit, y un `show()`
    // llamado ahí se pierde: es lo que dejaba la ficha cerrada al abrir un
    // enlace profundo en móvil. Esperar a updateComplete lo hace fiable.
    await drawer.updateComplete;
    if (transicion.has(drawer)) await esperarTransicion(drawer);
    drawer.show();
  }
  async function hide(drawer) {
    if (transicion.has(drawer)) await esperarTransicion(drawer);
    drawer.hide?.();
  }

  // Los disparadores son disclosures: deben reflejar si el panel está abierto.
  function bindToggle(btnId, drawer) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => show(drawer));
    drawer.addEventListener("sl-show", () => btn.setAttribute("aria-expanded", "true"));
    drawer.addEventListener("sl-after-hide", () => btn.setAttribute("aria-expanded", "false"));
  }
  bindToggle("btn-menu", drawerNav);
  bindToggle("btn-ficha", drawerInfo);

  vigilarDesbordeBarra();
  tooltipsAlTacto();
  seguirTeclado();

  return {
    isCompact: () => mq.matches,
    /** En compacto, muestra la ficha tras seleccionar algo. */
    openInfo: () => {
      if (mq.matches) show(drawerInfo);
    },
    closeNav: () => hide(drawerNav),
    closeInfo: () => hide(drawerInfo),
  };
}

/**
 * Tooltips de Shoelace con el dedo.
 *
 * Se abren con `hover focus`. Al tocar, el navegador emite un `mouseover` de
 * compatibilidad (y en Chrome, además, el botón coge el foco), pero el
 * `mouseout` no llega hasta que se toca OTRA cosa: el tooltip se quedaba
 * pegado encima de la barra de vistas o de la ficha. Con el dedo se pasan a
 * `manual` justo en el pointerdown —antes de que lleguen ese mouseover y ese
 * foco— y se muestran un momento tras el toque: sigue sirviendo para
 * descifrar «Ant», «Lat» o la estrella, sin quedarse. Con ratón (un iPad con
 * trackpad, un portátil táctil) vuelven a su disparador original.
 */
function tooltipsAlTacto() {
  const MOSTRAR_MS = 1600;
  let ultimoEsDedo = false;
  let abierto = null;
  let temporizador = 0;
  const tooltipDe = (e) => e.composedPath().find((n) => n.tagName === "SL-TOOLTIP") ?? null;

  document.addEventListener(
    "pointerdown",
    (e) => {
      ultimoEsDedo = e.pointerType === "touch";
      const tip = tooltipDe(e);
      if (ultimoEsDedo) {
        // Un toque en cualquier sitio retira el que estuviera a la vista.
        if (abierto && abierto !== tip) abierto.hide?.();
        if (tip && tip.trigger !== "manual") {
          tip.dataset.triggerOriginal = tip.trigger;
          tip.trigger = "manual";
        }
      } else if (tip?.dataset.triggerOriginal) {
        tip.trigger = tip.dataset.triggerOriginal;
        delete tip.dataset.triggerOriginal;
      }
    },
    { capture: true, passive: true },
  );
  document.addEventListener(
    "click",
    (e) => {
      if (!ultimoEsDedo) return;
      const tip = tooltipDe(e);
      if (!tip || tip.disabled || !tip.content) return;
      clearTimeout(temporizador);
      abierto = tip;
      tip.show?.();
      temporizador = setTimeout(() => {
        tip.hide?.();
        if (abierto === tip) abierto = null;
      }, MOSTRAR_MS);
    },
    { capture: true, passive: true },
  );
}

/**
 * Teclado virtual. En iOS (y en Chrome Android desde la v108) el teclado no
 * encoge la página: solo tapa su parte de abajo. El desplegable del buscador
 * medía hasta 360 px y en un teléfono apaisado quedaba casi entero debajo del
 * teclado. `visualViewport` sí dice qué parte se ve; se publica en CSS
 * --vv-fondo (la coordenada, en el viewport de la página, donde acaba lo
 * visible) y app.css acota con ello el desplegable en táctil. Con zoom del
 * navegador (escala ≠ 1) la vista visual encoge por el zoom, no por un
 * teclado: entonces cuenta como sin teclado.
 */
function seguirTeclado() {
  const vv = window.visualViewport;
  // Solo donde puede haber teclado en pantalla: con ratón no hace falta.
  if (!vv || !matchMedia("(any-pointer: coarse)").matches) return;
  const root = document.documentElement;
  let previo = -1;
  let raf = 0;
  const aplicar = () => {
    raf = 0;
    // Alto del viewport de la PÁGINA (el de los elementos fixed). No vale
    // innerHeight: en Safari de iOS mide la vista visual y encoge con el teclado.
    const altoPagina = root.clientHeight || innerHeight;
    const conZoom = Math.abs(vv.scale - 1) > 0.01;
    const fondo = conZoom ? altoPagina : Math.min(altoPagina, Math.round(vv.offsetTop + vv.height));
    if (fondo === previo) return;
    previo = fondo;
    root.style.setProperty("--vv-fondo", `${fondo}px`);
  };
  const pedir = () => {
    if (!raf) raf = requestAnimationFrame(aplicar);
  };
  vv.addEventListener("resize", pedir, { passive: true });
  vv.addEventListener("scroll", pedir, { passive: true });
  aplicar();
}

/**
 * La barra de vistas no cabe entera en un teléfono (11 botones en ~370 px) y
 * la fila se desplaza. Sin ninguna pista, los dos últimos —aislar y ayuda—
 * no existían para quien no supiera que la fila seguía. Se marca en
 * `data-desborda` qué lado esconde botones y el CSS difumina ese borde.
 */
function vigilarDesbordeBarra() {
  const barra = document.querySelector(".viewer__bar");
  const fila = document.getElementById("viewer-controls");
  if (!barra || !fila) return;
  const marcar = () => {
    const max = fila.scrollWidth - fila.clientWidth;
    const lados = [];
    if (max > 1 && fila.scrollLeft < max - 1) lados.push("derecha");
    if (max > 1 && fila.scrollLeft > 1) lados.push("izquierda");
    if (lados.length) barra.dataset.desborda = lados.join(" ");
    else delete barra.dataset.desborda;
  };
  fila.addEventListener("scroll", marcar, { passive: true });
  window.addEventListener("resize", marcar, { passive: true });
  // main.js pinta los botones después de initLayout(), y su ancho final
  // depende de las fuentes web: se vuelve a medir en ambos momentos.
  new MutationObserver(marcar).observe(fila, { childList: true });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(marcar).observe(fila);
  document.fonts?.ready.then(marcar);
  marcar();
}
