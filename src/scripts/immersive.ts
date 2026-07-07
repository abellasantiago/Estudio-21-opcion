/**
 * Motor inmersivo de la home de Estudio 21.
 * ------------------------------------------------------------
 * Aplica la capa de profundidad/movimiento (estilo activetheory, con identidad
 * de estudio y Z contenido) sobre el markup semántico de la home. Todo es
 * progressive enhancement: sin JS / prefers-reduced-motion / mobile → el sitio
 * queda estático y legible (esta capa ni se activa).
 *
 * Un único requestAnimationFrame maneja:
 *   · el giro del "Estudio 21" del hero (rotateY) + su retroceso y desvanecido
 *     a medida que la cámara avanza (se integra al fondo);
 *   · el "descenso" hero → cards: el corredor de marcos avanza en Z y el
 *     fantasma "21" del fondo gira lento (movimiento/profundidad continuos);
 *   · el paralaje de mouse de las capas [data-depth] + deriva autónoma del fondo;
 *   · el rail de progreso.
 *
 * Sólo se tocan `transform`/`opacity`. Al desactivar (resize a mobile, etc.) se
 * limpian todos los estilos inline — mismo patrón que `disable3D` del helicoidal.
 */

type Parallax = {
  el: HTMLElement;
  depth: number; // desplazamiento por mouse (proporción de MOUSE_RANGE)
  scroll: number; // paralaje de scroll (px por px scrolleado)
  drift: number; // amplitud de la deriva autónoma (px)
  rotate: number; // ° de rotateY a lo largo del descenso (0 = no rota)
  phase: number; // desfase de la deriva, para que no vayan todas iguales
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initImmersive(): void {
  const root = document.documentElement;
  // Sólo corre en páginas marcadas como inmersivas (la home).
  if (!root.hasAttribute('data-immersive-page')) return;

  const intro = document.querySelector<HTMLElement>('[data-immersive-intro]');
  const title = document.querySelector<HTMLElement>('[data-immersive-title]');
  const corridor = document.querySelector<HTMLElement>('[data-corridor]');
  // fin del "descenso": el arranque del helicoidal de proyectos (las cards).
  const descentEnd = document.getElementById('proyectos');
  // La aparición del header la resuelve el scroll siempre-activo de BaseLayout
  // (clase `past-hero`), no este motor → aparece aunque esta capa no arrancara.
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]');
  const scrollHint = document.querySelector<HTMLElement>('[data-scroll-hint]');

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(pointer: fine)');
  const wideMq = window.matchMedia('(min-width: 900px)');
  const capable = () => !reduceMq.matches && fineMq.matches && wideMq.matches;

  // ---- parámetros (Z contenido, movimiento cuidado) ----
  const TOTAL_ROTATION = 360; // ° que gira "Estudio 21" en el tramo del hero
  const TITLE_RECEDE = 460; // px que retrocede el título en Z mientras gira
  const CORRIDOR_DEPTH = 720; // px que avanza el corredor de marcos en el descenso
  const MOUSE_RANGE = 26; // px máx de desplazamiento por paralaje de mouse
  const DRIFT_SPEED = 0.00016; // velocidad de la deriva autónoma del fondo vivo

  let parallax: Parallax[] = [];
  let raf = 0;
  let running = false;
  let enabled = false;

  // estado animado (lerpeado en cada frame)
  let mx = 0;
  let my = 0;
  let tmx = 0;
  let tmy = 0;
  let angle = 0;

  function collect(): void {
    parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth || '0'),
      scroll: parseFloat(el.dataset.scroll || '0'),
      drift: parseFloat(el.dataset.drift || '0'),
      rotate: parseFloat(el.dataset.rotate || '0'),
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function onMouse(e: MouseEvent): void {
    tmx = (e.clientX / window.innerWidth) * 2 - 1;
    tmy = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function frame(now: number): void {
    if (!running) return;
    if (!document.hidden) {
      mx = lerp(mx, tmx, 0.06);
      my = lerp(my, tmy, 0.06);
      const scrollY = window.scrollY;

      // progreso del tramo del hero (0 al empezar → 1 al terminar el giro)
      let introProgress = 0;
      if (intro) {
        const range = intro.offsetHeight - window.innerHeight;
        introProgress =
          range > 0 ? clamp(-intro.getBoundingClientRect().top / range, 0, 1) : 0;
      }

      // progreso del "descenso" completo hero → cards (helicoidal)
      let descent = 0;
      if (descentEnd) {
        const absTop = descentEnd.getBoundingClientRect().top + scrollY;
        descent = absTop > 0 ? clamp(scrollY / absTop, 0, 1) : 0;
      }

      // "Estudio 21": gira sobre sí mismo, retrocede en Z y se desvanece
      // (se va integrando al fondo mientras la cámara avanza hacia las cards).
      angle = lerp(angle, introProgress * TOTAL_ROTATION, 0.1);
      if (title) {
        const recede = introProgress * TITLE_RECEDE;
        title.style.transform = `translateZ(${(-recede).toFixed(1)}px) rotateY(${angle.toFixed(2)}deg)`;
        // se mantiene bien visible girando y recién se desvanece al final del
        // tramo (introProgress 0.65 → 1), cuando se integra al fondo/espacio.
        title.style.opacity = clamp(1 - (introProgress - 0.65) / 0.35, 0, 1).toFixed(3);
      }

      // corredor de marcos: avanza hacia la cámara durante todo el descenso
      if (corridor) {
        corridor.style.transform = `translateZ(${(descent * CORRIDOR_DEPTH).toFixed(1)}px)`;
      }

      // las anotaciones mono del fondo se desvanecen al dejar el hero (para no
      // entorpecer la lectura) y reaparecen al volver — se multiplica su opacidad
      // por --hero-fade desde CSS (ver .lbg-note en immersive.css).
      const heroFade = clamp(1 - scrollY / (window.innerHeight * 0.7), 0, 1);
      root.style.setProperty('--hero-fade', heroFade.toFixed(3));

      // capas del fondo: mouse (todas) + scroll + deriva + rotateY (data-rotate)
      for (const p of parallax) {
        const drift = p.drift ? Math.sin(now * DRIFT_SPEED + p.phase) * p.drift : 0;
        const tx = mx * p.depth * MOUSE_RANGE + drift * 0.6;
        const ty = my * p.depth * MOUSE_RANGE + scrollY * p.scroll + drift;
        let t = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        if (p.rotate) t += ` rotateY(${(descent * p.rotate).toFixed(2)}deg)`;
        p.el.style.transform = t;
      }

      // el indicador de scroll se desvanece apenas se avanza
      if (scrollHint) {
        scrollHint.style.opacity = clamp(1 - introProgress * 6, 0, 1).toFixed(3);
      }

      // rail de progreso de toda la página
      if (railFill) {
        const max = root.scrollHeight - window.innerHeight;
        railFill.style.transform = `scaleY(${(max > 0 ? clamp(scrollY / max, 0, 1) : 0).toFixed(4)})`;
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function enable(): void {
    if (enabled) return;
    enabled = true;
    root.classList.add('is-immersive');
    collect();
    window.addEventListener('mousemove', onMouse, { passive: true });
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function disable(): void {
    if (!enabled) return;
    enabled = false;
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMouse);
    root.classList.remove('is-immersive');
    // limpiar todos los transforms/opacidades inline → fallback estático
    if (title) {
      title.style.transform = '';
      title.style.opacity = '';
    }
    if (corridor) corridor.style.transform = '';
    for (const p of parallax) p.el.style.transform = '';
    if (scrollHint) scrollHint.style.opacity = '';
    if (railFill) railFill.style.transform = '';
    root.style.removeProperty('--hero-fade');
    mx = my = tmx = tmy = angle = 0;
  }

  function evaluate(): void {
    if (capable()) enable();
    else disable();
  }

  evaluate();

  // reaccionar a cambios de preferencia / tamaño / tipo de puntero
  [reduceMq, fineMq, wideMq].forEach((mq) => mq.addEventListener?.('change', evaluate));
  window.addEventListener(
    'resize',
    () => {
      if (enabled) collect();
    },
    { passive: true },
  );
}
