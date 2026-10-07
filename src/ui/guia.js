/**
 * Guía «Cómo se usa».
 *
 * Se abre sola la PRIMERA vez (marca en localStorage) y después desde el botón
 * «?» de la cabecera o el menú. Está pensada para tablet y móvil: apartados
 * plegables de una o dos frases, con el de los gestos abierto, porque es lo
 * primero que hace falta y lo único que no se descubre tocando botones.
 *
 * Los gestos son los de OrbitControls tal como los configura scene.js
 * (`controls.touches = { ONE: ROTATE, TWO: DOLLY_PAN }`): un dedo gira, dos
 * dedos pellizcan para acercar y se arrastran para desplazar; tocar sin
 * arrastrar selecciona (picker.js). Los atajos de teclado son los que existen
 * en main.js y quiz.js, ni uno más.
 *
 * Se abre al empezar a cargar el modelo, no al terminar: la primera carga en
 * un móvil tarda, y leer la guía mientras tanto aprovecha esa espera.
 */
import { registrarDialogo, mostrar } from "./dialogos.js";
import { fraseRecuento, SELLOS } from "./sellos.js";

export const CLAVE_GUIA = "fisio-atlas:guia-vista";

const ico = (d, extra = "") =>
  `<svg class="guia__ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}${extra}</svg>`;
const ICO = {
  menu: ico(`<path d="M4 7h16M4 12h16M4 17h10"/>`),
  ficha: ico(`<path d="M5 4h11l3 3v13H5z"/><path d="M9 10h6M9 14h4"/>`),
  reset: ico(`<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>`),
  aislar: ico(`<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/>`),
  comparar: ico(`<path d="M9 5H4v14h5zM20 5h-5v14h5z"/><path d="M12 4v16"/>`),
  estrella: ico(`<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/>`),
};

function contenido(db) {
  const v = SELLOS.verificado;
  const p = SELLOS.pendiente;
  return `
    <div class="dlg__cuerpo guia">
      <p class="dlg__intro">Lo esencial en un minuto. Toca cada apartado para abrirlo.</p>

      <details class="guia__apartado" name="guia" open>
        <summary>Mover el modelo 3D</summary>
        <ul class="guia__lista" role="list">
          <li><span class="guia__gesto">Un dedo</span> Arrastra para girar el modelo.</li>
          <li><span class="guia__gesto">Dos dedos</span> Pellizca para acercar o alejar; arrástralos juntos para desplazarlo.</li>
          <li><span class="guia__gesto">Tocar</span> Toca un músculo, hueso, nervio o ligamento para abrir su ficha.</li>
          <li><span class="guia__gesto">Doble toque</span> Toca dos veces el fondo vacío para quitar la selección y volver a la vista general.</li>
          <li>${ICO.reset} El primer botón de la barra del visor vuelve a la vista general. <b>Ant</b>, <b>Post</b>, <b>Lat</b>, <b>Med</b>, <b>Sup</b> e <b>Inf</b> giran a las vistas anterior, posterior, lateral, medial, superior e inferior.</li>
          <li class="guia__secundario">Con ratón: arrastra para girar, botón derecho para desplazar, rueda para acercar y doble clic para volver a la vista general.</li>
        </ul>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Buscar</summary>
        <p>Escribe en el buscador de arriba. Encuentra estructuras por su <b>nombre</b> en español o en latín,
          por <b>acción</b> («flexión del codo»), por <b>inervación</b> («nervio mediano»), por <b>raíz</b>
          nerviosa («C5») o por <b>patología</b> («túnel carpiano»). Si un resultado aparece por algo que no es
          su nombre, debajo te dice por qué.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Capas y regiones</summary>
        <p>${ICO.menu} En tablet y móvil, el botón de arriba a la izquierda abre el menú (en pantallas grandes está siempre a la izquierda).</p>
        <ul class="guia__lista" role="list">
          <li><b>Capas</b>: enciende o apaga huesos, músculos superficiales, músculos profundos, nervios y ligamentos. Apaga los superficiales para ver los profundos.</li>
          <li><b>Regiones</b>: la lista de estructuras de cada zona del cuerpo, de la cabeza al pie.</li>
        </ul>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>La ficha de cada estructura</summary>
        <p>Tiene cuatro pestañas: <b>Información</b>, <b>Fisioterapia</b>, <b>Acción</b> e <b>Imágenes</b>.
          Toca un hueso de origen (azul) o de inserción (naranja) para ir a él; en el modelo se colorean igual.</p>
        <p>${ICO.ficha} En el móvil la ficha sube desde abajo; ciérrala con ✕ y vuelve a abrirla con el botón de arriba a la derecha.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Aislar y Comparar</summary>
        <ul class="guia__lista" role="list">
          <li>${ICO.aislar} <b>Aislar</b> (barra del visor): oculta todo menos la estructura elegida y sus huesos de origen e inserción. Vuelve a tocarlo para verlo todo.</li>
          <li>${ICO.comparar} <b>Comparar</b> (en la ficha): después toca una segunda estructura y verás las dos resaltadas, con sus datos lado a lado.</li>
        </ul>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Modo examen y tarjetas de repaso</summary>
        <p>En el menú, <b>Modo examen</b>. Elige <b>Reconocer el nombre</b> (el modelo señala una estructura y
          eliges cuál es) o <b>Señalar en el modelo</b> (te da el nombre y la tocas tú).</p>
        <p>Con <b>Repaso espaciado</b> funciona como unas tarjetas de repaso: lo que fallas vuelve pronto y lo
          que aciertas se espacia cada vez más. <b>Aleatorio</b> pregunta sin orden. Puedes filtrar por tipo y región.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Notas y favoritos</summary>
        <p>${ICO.estrella} En cada ficha, la estrella la marca como favorita: aparece en el menú, en <b>Favoritos</b>.
          En <b>Mi anotación</b> escribe lo que no está en el libro; se guarda sola, sin botón.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Los sellos «${v.texto}» y «${p.texto}»</summary>
        <ul class="guia__lista" role="list">
          <li><span class="ficha__sello-muestra ${v.clase}">${v.icono} ${v.texto}</span> ${v.explicacion}</li>
          <li><span class="ficha__sello-muestra ${p.clase}">${p.icono} ${p.texto}</span> ${p.explicacion}</li>
        </ul>
        <p class="guia__secundario">Hoy hay ${fraseRecuento(db)}. Toca el sello de una ficha para ver qué significa.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Añádela a tu pantalla de inicio</summary>
        <ul class="guia__lista" role="list">
          <li><b>iPhone o iPad</b>: en Safari, toca <b>Compartir</b> (el cuadrado con una flecha hacia arriba; si no lo ves, está dentro del botón <b>⋯</b>) y elige <b>«Añadir a pantalla de inicio»</b>.</li>
          <li><b>Android</b>: en Chrome, abre el menú <b>⋮</b> y elige <b>«Instalar aplicación»</b> (en algunos móviles pone «Añadir a pantalla de inicio»).</li>
        </ul>
        <p>Así se abre a pantalla completa, funciona sin conexión y el navegador no borra tus notas aunque pases unos días sin abrirla.</p>
      </details>

      <details class="guia__apartado" name="guia">
        <summary>Guarda una copia de tus datos</summary>
        <p>Tus notas, favoritos y repasos solo están en este dispositivo. Exporta una copia de vez en cuando
          (por ejemplo, cada semana de exámenes) y guárdala en Archivos, Drive o tu correo: con ella los recuperas
          en otro móvil o tablet.</p>
        <button type="button" class="btn btn--secundario" data-abrir="datos">Abrir «Mis datos»</button>
      </details>

      <details class="guia__apartado guia__apartado--teclado" name="guia">
        <summary>Atajos de teclado (con ordenador)</summary>
        <dl class="guia__atajos">
          <dt><kbd>/</kbd></dt><dd>Ir al buscador</dd>
          <dt><kbd>J</kbd> <kbd>K</kbd></dt><dd>Estructura siguiente / anterior</dd>
          <dt><kbd>A</kbd></dt><dd>Aislar la estructura elegida</dd>
          <dt><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></dt><dd>Vista anterior, lateral y posterior</dd>
          <dt><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></dt><dd>Girar el modelo</dd>
          <dt><kbd>Espacio</kbd></dt><dd>Girar solo (auto-rotación)</dd>
          <dt><kbd>B</kbd> <kbd>M</kbd> <kbd>P</kbd> <kbd>N</kbd> <kbd>L</kbd></dt><dd>Capas: huesos, músculos, solo superficiales, nervios, ligamentos</dd>
          <dt><kbd>Esc</kbd></dt><dd>Quitar la selección y volver a la vista general</dd>
          <dt><kbd>1</kbd>–<kbd>4</kbd> · <kbd>Intro</kbd></dt><dd>En el examen: responder · siguiente pregunta</dd>
        </dl>
      </details>
    </div>

    <div slot="footer" class="dlg__pie">
      <button type="button" class="btn btn--texto" data-abrir="acerca">Acerca de y créditos</button>
      <button type="button" class="btn btn--primario" data-cerrar>Entendido</button>
    </div>`;
}

function yaVista() {
  try {
    return !!localStorage.getItem(CLAVE_GUIA);
  } catch {
    // Sin almacenamiento no se puede recordar: mejor no abrirla en cada visita.
    return true;
  }
}

function marcarVista() {
  try {
    const d = new Date();
    localStorage.setItem(CLAVE_GUIA, new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  } catch {
    /* sin almacenamiento, la guía se ofrecerá también la próxima vez */
  }
}

export function initGuia({ db } = {}) {
  const dlg = document.getElementById("dlg-guia");
  if (!dlg) return { abrir: () => {}, abrirSiPrimeraVez: () => {} };
  let pintada = false;

  function pintar() {
    dlg.innerHTML = contenido(db);
    dlg.querySelector("[data-cerrar]")?.addEventListener("click", () => dlg.hide());
    pintada = true;
  }

  async function abrir() {
    if (!pintada) pintar();
    marcarVista();
    await mostrar(dlg);
  }

  registrarDialogo("guia", abrir);
  return {
    abrir,
    abrirSiPrimeraVez: () => {
      if (!yaVista()) abrir();
    },
  };
}
