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

- Dominio real (`site` en `astro.config.mjs` + `public/robots.txt`).
- Por proyecto: barrio, unidades, m², descripción (año y estado ya están).
- Fotos de proyectos y equipo; imagen OG en PNG/JPG 1200×630.
- Esta máquina no tiene Node instalado: instalar Node 20 LTS para correr/buildear.

## Historial de cambios

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
