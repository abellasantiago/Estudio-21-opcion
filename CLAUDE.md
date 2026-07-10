# CLAUDE.md — Contexto del Proyecto

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

## Cómo funciona

- **Proyectos:** content collection `proyectos` (`src/content.config.ts`, schema Zod),
  un `.md` por proyecto en `src/content/proyectos/`. Páginas `/proyectos/[slug]`.
- **Equipo:** datos en `src/data/equipo.ts`. Datos del estudio en `src/data/site.ts`.
- **Fotos por convención** (`src/lib/images.ts`): tirar imágenes en
  `src/assets/proyectos/<slug>/` y `src/assets/equipo/<slug>.jpg` y aparecen solas.
- Comandos: `npm install`, `npm run dev`, `npm run build` (→ `dist/`), `npm run preview`.

## Pendientes antes de publicar

- **Dominio real** en `site` (`astro.config.mjs`) + `public/robots.txt` — de ahí salen canonical, sitemap y URLs absolutas de OG.
- **Portadas y galerías de los 10 proyectos** (faltan): tirarlas en `src/assets/proyectos/<slug>/`.
- **Códigos `E21·NN` reales** de los 4 proyectos nuevos (hoy placeholders 15–18, marcados con `# PENDIENTE` en su `.md`).
- **Años estimados** de Villa Platero y Chana I; m² (área construida) de varios proyectos nuevos.
- Vila Rodona: confirmar mix de dormitorios y total de unidades. Sushi WOK: ficha muestra "Unidades: Pendiente" por ser comercial.
- m² de Cavas de Haedo es **estimado** (no oficial).

## Historial de cambios

### 2026-07-10 — feat: helicoidal — giro atado al pin del sticky + refresh al hero
- **El cilindro no gira hasta que el panel sticky se fija.** Nuevo `headOffset` en
  `ProyectosHelicoidal.astro` = px que scrollea la sección antes de que `.ph-sticky` se pinee
  (alto del header, `sticky.offsetTop`; se recalcula en `layout()`). `updateTarget` deja el
  progreso en **0** durante todo ese tramo (1ª card centrada) y mapea 0→1 sólo en el tramo
  pineado `[headOffset .. offsetHeight-innerHeight]`. `scrollToIndex` (foco por teclado) usa el
  mismo modelo. Antes el giro arrancaba apenas entraba la sección.
- **Filtros sin salto ni glitch.** Al filtrar en 3D se mantiene la posición y se remapea el
  recorrido al nuevo N (progreso 0..1 reescalado). Si pasás a un estado con **menos** proyectos y
  tu posición queda más allá del final del nuevo recorrido, se rebobina al **arranque del
  helicoidal** (`offsetTop + headOffset`, no al tope de la sección). Se salta al inicio **antes**
  de acortar la sección y con `behavior:'instant'` — **no `'auto'`**, que respeta el
  `scroll-behavior:smooth` del `html` y animaría (era la causa del "flash" de pasar por el
  medio/final antes de llegar).
- **Recargar vuelve al hero.** `BaseLayout.astro`: `history.scrollRestoration='manual'` +
  `scrollTo(0,0)` si no hay ancla → al refrescar arranca arriba en vez de restaurar la posición
  previa (respeta anclas `/#seccion`).
- Incluye ajustes en curso de hero/blueprints, `immersive.ts` y fotos del equipo
  (`santiago-abella2.png` nuevo).
- Build validado (12 páginas). Trabajo directo en `main` (sin rama): commit `58ecd50` (código) + docs.

### 2026-06-26 — feat: limpiar cards del helicoidal (sin código, sin fondos, CTA en hover)
- **Cartelito `E21·NN` eliminado** de las cards: se quitó el `<span class="ph-code">` del markup
  y todas sus reglas CSS (antes arriba-izquierda de la portada).
- **Nombre gigante de fondo eliminado:** se borró el `<p class="ph-bgname">` (nombre + código del
  proyecto centrado), la función `updateBgName` y su CSS/cross-fade.
- **Grilla blueprint de fondo eliminada:** se quitó el `<span class="ph-grid">`, su parallax en el
  `render()` y sus estilos. El parallax multicapa queda con fantasma "21" + marcas de registro.
- **CTA "Ver proyecto" sólo en hover de la card centrada:** antes se mostraba fija en la card al
  frente (`.is-front`); ahora la regla exige `.is-front` **y** `:hover`, con fade hacia abajo al
  entrar/salir (nunca aparece sola).
- Build validado (12 páginas). Rama mergeada: `claude/condescending-proskuriakova-d3ceec` → `main`

### 2026-06-26 — feat: pulir hero y navbar; renombrar sección "modelo" a "nosotros"
- **Navbar:** el logo `banner_negro.png` ("ESTUDIO 21 ARQUITECTOS") reemplaza el ícono "21"
  (se quitó el texto redundante "Estudio 21"); altura del logo `2rem`. Navbar **más fina**:
  `74px → 58px` (offset del menú mobile también a 58px).
- **Nav links:** ahora **Inicio · Nosotros · Proyectos · Equipo · Contacto**. "Nosotros" → `/#nosotros`.
  "Contacto" dejó de ser CTA con recuadro: es un link normal con el mismo hover (subrayado fino +
  oscurecido), sin el relleno oscuro que opacaba todo. Se eliminaron los estilos `.nav-cta`.
- **Hero:** eyebrow ahora dice **"Arquitectura que trasciende"**. El texto del hero y la marca se
  corren a la izquierda con un token `--hero-shift` (clamp atado al margen vacío del centrado;
  se anula en pantallas chicas). Token nuevo en `global.css`; clase `.hero-main` en el bloque de texto.
- **Stats del hero:** cada celda con margen interno (`padding 1.5rem 1.6rem`, ya no pegadas al
  borde/divisor) y **sin los numeritos** `01/02/03` (se quitó el markup `.tag` y su CSS).
- **Renombrado "modelo" → "nosotros" (sólo código, sin cambio visual):** `Modelo.astro` →
  `Nosotros.astro`, `modelo.css` → `nosotros.css` (con `git mv`); `id` de la sección, imports,
  comentario, uso en `index.astro` y ancla del nav actualizados. Bloques **F01–F04** con margen
  izquierdo (`padding-left 1.6rem` + el punto `.dot` corrido), reseteado en mobile.
- Build validado (12 páginas). Rama mergeada: `claude/lucid-snyder-da12a2` → `main`

### 2026-06-25 — feat: mejorar fluidez, zoom central y nitidez del carrusel helicoidal
- **Header fuera del sticky:** título, filtros y contador scrollean con la página; el panel sticky
  sólo contiene el cilindro 3D.
- **Parallax multicapa:** grilla blueprint (veloz), fantasma "21" (lento) y marcas de registro
  (intermedio) a distintas velocidades → sensación real de profundidad.
- **Nombre gigante de fondo:** nombre + código `E21·NN` del centrado, sobredimensionado
  detrás del cilindro, con cross-fade al cambiar de proyecto.
- **Zoom al centro:** pico **1.70×**, ventana 22° (pop aislado); radio 540px; filtros compactos
  (`MAX_STEP=34°`); sin snap automático (scroll libre = más fluido).
- **Supersampling 2×:** card maquetada a 376×524px y reducida ÷2 por script → foto, títulos y
  badge nítidos aunque la central esté a 1.70× + perspectiva. `will-change:transform` eliminado;
  perspectiva 2600px; `widths [400,600,820,1080]`, `quality 88`.
- Rama mergeada: `claude/wonderful-lalande-90c426` → `main`

### 2026-06-24 — feat: pulido del carrusel helicoidal (nitidez, separación, foco central)
- **Imágenes/estética:** `<Image>` con srcset más denso `[240,360,480,640]`, `sizes`
  acorde y `quality 82`; la thumb pasa a **`aspect-ratio: 4/3`** (encuadre natural, sin
  recorte agresivo). Card más alta (**192×264**, antes 172×230) + más padding en la meta
  → el **badge de estado** ahora entra siempre.
- **Más separación entre cards:** `RADIUS` 330→**440** (160→250 mobile; círculo más
  amplio) y `VERT_STEP` 55→**64**. Perspectiva 1050→**1450px** (980 mobile) y
  `SCALE_MAX` 1.14→**1.0**: menos foreshortening = cards menos deformadas y más nítidas.
- **Card central con protagonismo:** zoom propio (`zoomExtra` hasta **+12%**, sólo en el
  tramo final al frente, continuo) + sombra extra en `.is-front`.
- **Laterales atenuadas:** `blur()` progresivo (0 al frente, hasta **3px** al dorso) y
  opacidad con falloff más marcado (**`cosT^2.6`**, antes `cosT²`).
- Todo dentro del `render()` y listeners existentes; fallback `prefers-reduced-motion`
  intacto (blur/zoom/sombra sólo en modo 3D, reseteados en `disable3D`). Build validado
  (ahora **sí hay `node`** en el entorno).
- ⚠️ **Siguen faltando las portadas reales** (`src/assets/proyectos/<slug>/portada.jpg`):
  las 10 cards muestran el placeholder "imagen pendiente". La nitidez real depende de
  subir fotos ≥640px de ancho (~4:3).
- `package-lock.json` ahora versionado. Rama mergeada: `claude/naughty-brown-3c0926` → `main`

### 2026-06-24 — feat: sección de proyectos como carrusel helicoidal 3D
- Nuevo componente `src/components/ProyectosHelicoidal.astro` (+ `src/styles/proyectos-helicoidal.css`):
  las cards se distribuyen en un **cilindro 3D** (CSS 3D transforms) que rota y
  desciende atado al **scroll** (sección alta + panel `sticky` de 100vh; el progreso
  0→1 mapea a la rotación/descenso, sin secuestrar el scroll). Escala y opacidad se
  interpolan con curva de coseno (frente grande/nítido → dorso chico/desvanecido).
  Parámetros: `RADIUS 280` (168 en mobile), `VERT_STEP 30`, `SCALE 0.78→1.14`.
- **Reemplaza** la grilla anterior como sección `#proyectos`, **conservando el filtro**
  por estado (Todos / Próximamente / En proceso / Terminados): filtrar reconstruye el
  cilindro sólo con los proyectos del estado elegido y reinicia el recorrido.
- **Progresión de mejora:** el markup base es una **lista semántica** de proyectos
  (links accesibles, navegables por teclado; el foco rota el cilindro a esa card). Sin
  JS o con `prefers-reduced-motion` queda una **grilla estática accesible** (mismos
  breakpoints que antes). El efecto 3D es sólo capa de presentación.
- Performance: `rAF` activo sólo con la sección visible (`IntersectionObserver`),
  `will-change` y sólo se tocan `transform`/`opacity`. Imágenes lazy salvo las 3 primeras.
- Coherencia visual: usa los tokens globales, el encabezado de sección estándar
  (eyebrow + `section-title`), contador mono `01 / NN`, fantasma "21" y marcas de
  registro; la card es reconociblemente la misma del resto del sitio.
- **Eliminados** (huérfanos al reemplazar la grilla): `sections/Proyectos.astro`,
  `ProjectCard.astro`, `styles/proyectos.css`.
- ⚠️ Sin `node` en el entorno: **falta correr `npm run build`** para validar el build.

### 2026-06-23 — feat: 4 proyectos nuevos + sección "Nuestro equipo"
- Nuevo estado `proximamente` en el schema (`content.config.ts`), con su chip de
  estado (color petróleo) y botón de filtro propio en la grilla de proyectos.
- 4 proyectos cargados desde sus memorias: **Chana I** (Cordón, 35 unidades),
  **Vila Rodona** (Brazo Oriental, entrega ago-2027), **Villa Platero** (Prado,
  24 unidades) en "próximamente"; **Sushi WOK Perú** (Carrasco, 253 m², primer
  proyecto comercial) en "en proceso".
- Sección "El estudio" → **"Nuestro equipo"** (eyebrow, link del nav y descripción).
- Rol "Dirección de Empresas" con mayúscula.
- **Pendiente en los 4 nuevos:** códigos `E21·NN` reales (hoy placeholders 15–18),
  años de Villa Platero y Chana I (estimados), m² de varios, fotos/galerías.
  Vila Rodona: confirmar mix de dormitorios (memoria vs. web vieja) y total de unidades.
- Rama mergeada: `claude/nervous-panini-e24bee` → `main`

### 2026-06-23 — feat: carga de contenido real + marca
- 6 proyectos con datos reales (estado, barrio, año, unidades, m²) y descripciones; m² de Cavas de Haedo estimado.
- Fotos del equipo (6) optimizadas; `alt` con nombre + rol.
- Marca: favicon e ícono del navbar con el "21" oficial; OG home (banner) y OG por proyecto (su portada).
- Contacto: mail real `estudiodearquitectos21@gmail.com` en texto + JSON-LD.
- Pendiente: portadas/galerías de proyectos y dominio real en `site`.
- Rama mergeada: `claude/condescending-wright-3fa9ea` → `main`

### 2026-06-23 — feat: migración de WordPress a Astro
- Scaffold Astro + TypeScript: configuración, tokens de color/tipografía y helpers.
- Home migrada 1:1 desde `design/estudio21-home.html` (Hero, Modelo, Proyectos, Estudio, Contacto).
- Colección `proyectos` con Zod + 6 proyectos (datos faltantes marcados como PENDIENTE).
- Páginas de detalle `/proyectos/[slug]` con `getStaticPaths` (portada, ficha, galería, descripción).
- Fuentes locales (Fontsource) con preload de Space Grotesk 500.
- SEO: BaseHead (meta únicos, canonical, OG/Twitter), JSON-LD, sitemap, robots.txt.
- Imágenes optimizadas, accesibilidad (skip-link, focus-visible, alt) y `prefers-reduced-motion`.
- README en español (instalación, agregar proyectos/fotos, deploy).
- Rama mergeada: `claude/condescending-wright-3fa9ea` → `main`
