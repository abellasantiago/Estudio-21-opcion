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
