# CLAUDE.md — Contexto del Proyecto

> **Este archivo es un resumen vivo del estado actual del sitio, no un changelog.**
> Mantenerlo siempre al día: cuando algo cambia, se actualiza la sección
> correspondiente para que describa *cómo es el sitio hoy* (no "qué se modificó").
> El detalle cronológico de cambios queda en el historial de git.

## Descripción

Sitio web de **Estudio 21**, desarrolladora inmobiliaria boutique de Montevideo,
Uruguay. Migrado de WordPress a un **sitio estático con Astro**. El objetivo es
transmitir la imagen de un estudio de arquitectura moderno y atraer inversores.

La **fuente de verdad visual** es `design/estudio21-home.html`: hay que preservar
esa estética (paleta hormigón cálido + tinta + acento petróleo; tipografías Space
Grotesk / Inter / IBM Plex Mono; el "21" sobredimensionado de fondo; marcas de
registro), no rediseñar. Todo el copy va en **español rioplatense**.

## Stack

- **Astro** (estático) + **TypeScript**, sin frameworks de UI, JS mínimo.
- **CSS propio** (sin Tailwind): `src/styles/global.css` con tokens + un `.css` por componente.
- **Fontsource** (fuentes locales woff2, sin Google Fonts CDN), `@astrojs/sitemap`, `sharp`.
- Imágenes con `<Image>/<Picture>` de Astro (AVIF + WebP + srcset).
- Comandos: `npm install`, `npm run dev` (→ `http://localhost:4321`), `npm run build`
  (→ `dist/`), `npm run preview`, `npm run check` (astro check).

## Contenido y datos

- **Proyectos:** content collection `proyectos` (`src/content.config.ts`, schema Zod),
  un `.md` por proyecto en `src/content/proyectos/` (frontmatter con datos + cuerpo =
  descripción). Páginas de detalle `/proyectos/[slug]` con `getStaticPaths`.
  Estados posibles: `en-proceso` · `proximamente` · `terminado` (cada uno con su chip).
- **Equipo:** los integrantes en `src/data/equipo.ts`. Datos del estudio (mail,
  dirección, redes) en `src/data/site.ts` — lo que se completa aparece solo en Contacto.
- **Fotos por convención** (`src/lib/images.ts`): tirar imágenes en
  `src/assets/proyectos/<slug>/` (`portada.*`, `galeria-*.*`) y `src/assets/equipo/<slug>.*`
  y aparecen solas, sin listarlas. Hasta que existan, se muestra un placeholder.

## Home — secciones

Orden: **Hero · Nosotros · Proyectos · Equipo · Contacto** (`src/pages/index.astro`).
Navbar fina (58px) con el logo `banner_negro.png` ("ESTUDIO 21 ARQUITECTOS"); links
**Inicio · Nosotros · Proyectos · Equipo · Contacto** ("Contacto" es un link normal,
no CTA con recuadro).

### Preloader (sólo home)
`src/components/Preloader.astro` + `src/styles/preloader.css`, montado en `BaseLayout`
sólo cuando `immersive` (la home), como primer hijo del `<body>`.
- Overlay a pantalla completa (fondo `--paper`, con los mismos **ghost "21"** tenues del
  hero detrás — `.pl-ghost`, empalman al hacer fade) donde una **planta arquitectónica** en
  hardline (trazos finos y suaves en tono `--ink-soft`, tamaño contenido) se **dibuja trazo
  por trazo** (stroke-dashoffset por elemento con `pathLength=1`): fase 1 contorno + cotas,
  fase 2 tabiques/aberturas (puertas con barrido, ventanas), fase 3 mobiliario (aparece con
  **fade**, evita los puntitos que dejan las formas cerradas al dibujarse), fase 4
  norte/escala/carátula. Minimalista: sin rótulos de ambiente ni m², sin marcas de esquina,
  sin HUD; muros a doble línea con cap `butt`. Al completar el dibujo se mantiene **~0,6 s** y
  hace la **transición "swap en Z"**: la lámina retrocede en Z y se desvanece mientras
  **"Estudio 21" llega desde el fondo girando** (`.pl-brand`, mismo tamaño/posición que el
  hero — clamp 22rem) y se asienta; el overlay hace **cross-fade** al hero real (el "21" ya
  girando en 3D). Fases del cierre en el script: `is-transition` (retroceso + llegada) → `is-done`.
- El script del componente asigna los delays escalonados por fase, bloquea el scroll
  (`html.pl-lock`) y cierra con `is-done`. Robustez: si la pestaña carga oculta espera a
  ser visible (rAF/animaciones están pausadas en background); `<noscript>` lo oculta sin
  JS; con `prefers-reduced-motion` no se muestra; se saltea con cualquier interacción.
- Duración fija (~2,8 s de dibujo + fade). La planta es genérica ("unidad tipo"), no un
  proyecto real: se puede cambiar por la planta de un proyecto cuando se quiera.

### Hero (capa inmersiva)
- Motor en `src/scripts/immersive.ts` (sólo en la home, `data-immersive-page`, y sólo
  si no hay `prefers-reduced-motion`, con puntero fino y pantalla ≥900px). Progressive
  enhancement: sin eso, queda estático y legible.
- El "Estudio 21" gira en 3D (rotateY continuo + extra atado al scroll del hero,
  retrocede en Z y se desvanece integrándose al fondo), parallax de mouse en las capas
  `[data-depth]`, corredor de marcos que avanza en Z, rail de progreso.
- Easter egg de blueprint "linterna" (`HeroBlueprints.astro`): **un solo plano**, a la
  izquierda del "21" (PLANTA); se descubre pasando el mouse (dibujo tipo lápiz por
  segmentos) y al salir queda "durmiendo" tenue. El de la fachada (derecha) se sacó.
- **`--hero-fade`** (seteado por `immersive.ts` según el scroll) desvanece al dejar el
  hero y trae de vuelta al subir: las notas mono del fondo vivo, el blueprint izquierdo,
  el eyebrow **"Arquitectura que trasciende"** (combinado con su reveal-on-scroll inicial
  vía una custom property `--reveal`, no pisa la transición de `.reveal`) y la línea
  **"21 de Setiembre 3024"** (`.hero-dim`). El texto/marca se corren a la izquierda con
  el token `--hero-shift` (se anula en pantallas chicas).

### Proyectos — carrusel helicoidal 3D
`src/components/ProyectosHelicoidal.astro` + `src/styles/proyectos-helicoidal.css`.
- Las cards se distribuyen en un **cilindro 3D** que rota y desciende atado al **scroll**
  (sección alta + panel `.ph-sticky` de 100vh; sin secuestrar el scroll). Escala/opacidad
  por curva de coseno (frente grande/nítido → dorso chico/desvanecido/blur). **Zoom al
  centro** con pico ~**1.70×** (ventana angosta = pop aislado), `RADIUS` 540 (300 mobile),
  **supersampling 2×** (card maquetada al doble y reducida ÷2 → nítida), sin snap.
- **Header (título) fuera del sticky:** scrollea con la página. En modo 3D la **barra de
  filtros + contador** se relocaliza al panel sticky (pineada mientras se recorre).
- **El giro arranca sólo cuando el panel se fija.** `headOffset` (= `sticky.offsetTop`,
  alto del header; recalculado en `layout()`) marca cuánto scrollea la sección antes de
  pinearse. `updateTarget` deja el progreso en **0** en ese tramo (1ª card centrada) y lo
  mapea 0→1 sólo en el tramo pineado `[headOffset .. offsetHeight-innerHeight]`.
  `scrollToIndex` (foco por teclado) usa el mismo modelo.
- **Filtros** (Todos / En proceso / Próximamente / Terminados): filtrar reconstruye el
  cilindro con el subconjunto y **mantiene tu posición** remapeando el recorrido al nuevo
  N. Si pasás a un estado con **menos** proyectos y tu posición queda más allá del final,
  se **rebobina al arranque del helicoidal** (`offsetTop + headOffset`) con salto
  instantáneo (ver nota `behavior:'instant'` abajo).
- **Toggle "Ver todos" ⇄ "Volver al giro"** (`#phViewToggle`; la sección lleva
  `.is-toggleable` cuando el 3D está activo): alterna el cilindro por una **grilla estática
  con todos los proyectos a la vista** (salida rápida para quien no quiere recorrer todo el
  scroll). No es un fade — las cards **viajan** entre estados: desenrollar (cilindro→grilla)
  usa **FLIP** (se mide el rect de cada card en el cilindro y se la suelta en su celda con
  traslación+escala+fade, cascada leve por índice); reensamblar (grilla→cilindro) hace un
  **bloom** (nacen chicas/translúcidas en su lugar del anillo) y reposiciona el scroll al
  arranque del helicoidal. El botón vive en el header en grilla y se **relocaliza pineado**
  (arriba-derecha del panel; abajo-derecha en mobile) en 3D; respeta el subconjunto filtrado
  y se protege de clicks a mitad de transición (clase `.is-flipping`, que además libera el
  `overflow` para que las cards no se corten al volar). Con `prefers-reduced-motion` o sin JS
  el toggle no aparece (queda la grilla accesible de siempre).
- **Cards limpias:** sin cartelito `E21·NN`, sin nombre gigante de fondo, sin grilla
  blueprint; el fondo del panel es parallax multicapa (fantasma "21" + marcas de registro).
  El CTA "Ver proyecto" aparece **sólo en hover de la card al frente**.
- **Fallback:** el markup base es una lista semántica accesible (links navegables por
  teclado). Sin JS o con `prefers-reduced-motion` → grilla estática accesible; el 3D es
  sólo capa de presentación. `rAF` activo sólo con la sección visible
  (`IntersectionObserver`); sólo se tocan `transform`/`opacity`.

### Nosotros / Equipo / Contacto
- **Nosotros** (`Nosotros.astro` / `nosotros.css`, ancla `/#nosotros`): bloques F01–F04.
- **Equipo** ("Nuestro equipo"): fotos optimizadas, `alt` con nombre + rol.
- **Contacto:** mail real `estudiodearquitectos21@gmail.com` en texto + JSON-LD.

## Interacciones globales y SEO

- **JS global** (`BaseLayout.astro`): menú móvil, sombra del header al scrollear
  (`.scrolled` / `.past-hero`), reveal-on-scroll (`IntersectionObserver`), y la capa
  inmersiva. **Al recargar se vuelve al hero:** `history.scrollRestoration='manual'` +
  `scrollTo(0,0)` si no hay ancla (respeta `/#seccion`).
- **SEO/accesibilidad:** `BaseHead` (meta únicos, canonical, OG/Twitter, JSON-LD),
  sitemap, robots.txt; skip-link, focus-visible, `alt`, y todo respeta
  `prefers-reduced-motion`. Marca: favicon/navbar con el "21"; OG home (banner) y OG por
  proyecto (su portada).

## Notas técnicas / convenciones

- **`window.scrollTo` instantáneo:** el `<html>` tiene `scroll-behavior: smooth`, y
  `behavior:'auto'` **respeta** ese valor (anima). Para saltos secos (p.ej. rebobinar el
  helicoidal al filtrar) usar **`behavior:'instant'`**, no `'auto'`.

## Pendientes antes de publicar

- **Dominio real** en `site` (`astro.config.mjs`) + `public/robots.txt` — de ahí salen canonical, sitemap y URLs absolutas de OG.
- **Imagen para compartir:** reemplazar `public/og-default.svg` por un PNG/JPG 1200×630 (WhatsApp no renderiza SVG) y actualizar `ogImage` en `src/data/site.ts`.
- **Portadas y galerías de los 10 proyectos** (faltan): tirarlas en `src/assets/proyectos/<slug>/` (≥640px, ~4:3, para que la nitidez del helicoidal rinda).
- **Códigos `E21·NN` reales** de los 4 proyectos nuevos (hoy placeholders 15–18, marcados con `# PENDIENTE` en su `.md`).
- **Años estimados** de Villa Platero y Chana I; m² (área construida) de varios proyectos nuevos.
- Vila Rodona: confirmar mix de dormitorios y total de unidades. Sushi WOK: ficha muestra "Unidades: Pendiente" por ser comercial.
- m² de Cavas de Haedo es **estimado** (no oficial).
- El **README** tiene partes desactualizadas (menciona la grilla vieja, `ProjectCard.astro`, la sección "Modelo"): conviene ponerlo al día en algún momento.
