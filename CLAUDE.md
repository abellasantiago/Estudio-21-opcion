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
- Overlay a pantalla completa (fondo `--paper` **limpio** mientras se arma — sin ghosts
  propios) donde una **planta arquitectónica minimalista** en hardline
  (trazos finos y suaves en tono `--ink-soft`, lámina **chica y tenue** — `.pl-sheet`
  `min(42vw, 430px)` con `opacity: 0.7`, para que quede como un símbolo de carga sin
  protagonismo, `viewBox` ajustado al edificio) se **dibuja trazo por trazo** (stroke-dashoffset
  por elemento con `pathLength=1`, **trazo pausado** — `STROKE` 0,7 s con easing tipo lápiz):
  fase 1 contorno (envolvente a doble línea), fase 2 tabiques/aberturas (puertas con barrido,
  ventanas), fase 3 mobiliario (aparece con **fade**, evita los puntitos que dejan las formas
  cerradas al dibujarse), fase 4 **grafismo mínimo** (cota general de ancho y de alto —
  **en paralelo, mismo delay por índice vía `data-step`, se dibujan a la vez** — y recién
  al terminar ambas entra la escala gráfica; **la opacidad tenue va en el grupo `.pl-graf`,
  no en cada elemento**, para que `.pl-fade` oculte los números hasta su turno y no
  aparezcan un instante al inicio; números mono con fade). Abajo, un **indicador de carga**
  (`.pl-loader`): barra que se completa (`.pl-bar-fill`, `scaleX` en `--pl-load` = duración
  del trazado, seteada por el script) + **porcentaje mono 0→100** (rAF en `run()`). El dibujo se
  percibe **capa por capa** (`step`/`gap` por fase, más deliberado en contorno y grafismo;
  ~4 s en total). Minimalista igual: **sin carátula ni rótulos de ambiente**, sin marcas de
  esquina, sin HUD; muros a doble línea con cap `butt`. En las uniones tabique↔muro y
  tabique↔tabique, la línea **exterior/lejana** del elemento atravesado queda continua y
  la línea **interior/cercana** se abre justo en el ancho del tabique que entra — así no
  hay ninguna raya cruzando entre las dos líneas del tabique y la unión se lee fundida en
  una sola pieza, no como dos muros que se cruzan. Al completar el dibujo se mantiene
  **~0,35 s** y hace la **transición "barrida hacia arriba"** (lenta, ~1,2 s): **TODO el overlay** (papel + plano)
  se barre subiendo como un telón (`.preloader.is-transition` con `pl-wipe-up` — `clip-path`
  `inset` que sube + leve empuje en Y) y deja ver **directamente el hero real**: el "21" que
  **ya viene girando en 3D detrás** (`immersive.ts` lo gira desde el load) **junto con sus
  "21" fantasma de fondo** (`.lbg-ghost`, que recién aparecen al levantarse el telón). **No
  hay "21" intermedio** — no se percibe ningún cambio de un 21 a otro. Cierre en el script:
  `is-transition` (barrida) → `is-done` (quita el overlay ya invisible).
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
- **Material grafito** (referencia: render de producto sobre papel): las capas del
  extruido van de un gris cálido iluminado al fondo a casi negro al frente con
  **oscurecimiento cuadrático** (la mayor parte del canto queda en el gris iluminado y
  recién se funde a negro contra la cara → lateral liso y claro); la cara frontal
  (`.ht-face`) lleva un degradé "sheen" cenital vía `background-clip:text` (fallback:
  `--ink` plano). Dígitos casi tocándose (letter-spacing −0.045em), extrusión 38px /
  16 capas. "Estudio" en peso 700, mismo material.
- **Sombra proyectada** (`.ht-shadow`): plano acostado (`rotateX(90°)`) **sobre la
  baseline real de los dígitos** (cae al **91,9% de la caja, medido** — métricas de
  Space Grotesk × line-height 0.82, los dígitos no tienen descender; el plano va en
  `top: 92%`: cualquier valor más abajo deja un gap y el "21" parece flotar),
  **dentro del bloque preserve-3d** → gira en el piso junto con el "21", se
  acorta/alarga con la perspectiva y retrocede/desvanece con él. Cuádruple degradé
  radial: **oclusión de contacto muy angosta y casi negra pegada a la línea de
  apoyo** (el "21" se lee APOYADO, sin aire entre glifo y sombra) + banda de
  oclusión + núcleo + halo corridos hacia cámara-izquierda. `--shadow-pulse` (motor)
  la respira según el ángulo (de canto proyecta menos). Funciona también en el
  fallback (la rota la animación CSS `hero-spin-y`).
- **Nave wireframe** (`HeroWireframe.astro` + `hero-wireframe.css`): pabellón vidriado
  en wireframe de fondo del "21", con **proyección 3D real** calculada en build (cámara
  pinhole — focal, altura de ojo — y nave girada 38° respecto del plano de cuadro → dos
  puntos de fuga francos). **La ESQUINA de la nave (el vértice) queda detrás del "2"**
  (viewBox ≈ x 705) y de ahí fuga hacia los dos lados: a la **derecha** la fachada
  larga (36 vanos → VPR ≈ (1503, HOR), casi en el borde) con **mucho más recorrido**,
  que se **dispersa con un fade propio del SVG** (máscara `wf-fade` con degradé
  horizontal 1000→1400, se traga el testero — fade out bien lejano); a la
  **izquierda** la fachada corta (5 vanos → VPL ≈ (−352, HOR), fuera de cuadro pero
  cerca → pendiente visible), recorrido ~mitad. La nave está a **20 m** (esquina) →
  queda **baja, en la banda media de los dígitos**, y su línea de piso sube hacia el
  **horizonte bajo** (≈60% de la altura de los dígitos): mismo plano de suelo que el
  "21", más atrás — fondo, sin protagonismo. Trazo denso: columnata a paso real con
  opacidad según distancia, segunda fila de columnas, cubierta + fascia, cerchas a dos
  cordones con montantes de alma en tramos cercanos, correas, rieles + montantes de
  vidriado (se rarifican con la distancia), rieles del plano de fondo, zócalo,
  baldosado de piso en las dos direcciones y prolongaciones de boceto (hacia
  arriba-izquierda detrás de "ESTUDIO", y más allá de ambos extremos). Tenue
  (`--concrete`, máscara radial en bordes; fallback 0.65, inmersivo tope 0.8). En
  inmersivo **se revela con el recorrido acumulado del mouse** (`--wf-reveal`,
  smoothstep + lerp, lo escribe el motor) y se va con `--hero-fade`; en fallback queda
  visible estático; **oculto en <900px** (el recorte lo magnificaba sobre los textos).
- **Textura técnica**: grano de papel (feTurbulence en data-URI, multiply, opacidad
  0.07, `.lbg-grain`) en el fondo vivo. Luz de estudio en el stage
  (`.hero-stage::before`: centro apenas más claro + viñeta sutil). Los parches de
  puntos matriz que hubo acá se sacaron (no gustaron).
- Easter egg de blueprint "linterna" (`HeroBlueprints.astro`): **desactivado por ahora**
  (import y uso comentados en `Hero.astro`, el componente y su CSS quedan intactos para
  retomarlo). Cuando esté activo: un solo plano a la izquierda del "21" (PLANTA); se
  descubre pasando el mouse (dibujo tipo lápiz por segmentos) y al salir queda
  "durmiendo" tenue. El de la fachada (derecha) se sacó.
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
