import type { ImageMetadata } from 'astro';

/**
 * Descubre las imágenes automáticamente por convención de carpetas, así
 * alcanza con tirar los archivos en su lugar para que aparezcan en el sitio
 * (no hace falta listarlos en el frontmatter).
 *
 *   Proyectos:  src/assets/proyectos/<slug>/portada.jpg   -> portada
 *               src/assets/proyectos/<slug>/galeria-01.jpg -> galería
 *   Equipo:     src/assets/equipo/<slug>.jpg               -> retrato
 *
 * Formatos aceptados: jpg, jpeg, png, webp, avif.
 */

const proyectoFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/proyectos/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const equipoFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/equipo/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const isPortada = (path: string) => /\/portada\.[^/]+$/i.test(path);

function filesDeProyecto(slug: string): [string, ImageMetadata][] {
  return Object.entries(proyectoFiles)
    .filter(([path]) => path.includes(`/proyectos/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([path, mod]) => [path, mod.default]);
}

/** Portada del proyecto: `portada.*` si existe, si no la primera imagen de la carpeta. */
export function getPortada(slug: string): ImageMetadata | undefined {
  const files = filesDeProyecto(slug);
  if (files.length === 0) return undefined;
  const portada = files.find(([path]) => isPortada(path));
  return (portada ?? files[0])[1];
}

/** Galería del proyecto: todas las imágenes menos la portada, ordenadas por nombre. */
export function getGaleria(slug: string): ImageMetadata[] {
  return filesDeProyecto(slug)
    .filter(([path]) => !isPortada(path))
    .map(([, img]) => img);
}

/** Retrato de un integrante del equipo por slug. */
export function getFotoEquipo(slug: string): ImageMetadata | undefined {
  const entry = Object.entries(equipoFiles).find(([path]) =>
    new RegExp(`/equipo/${slug}\\.[^/]+$`, 'i').test(path),
  );
  return entry?.[1].default;
}

/** Iniciales para el placeholder del equipo (ej. "Gustavo Abella" -> "GA"). */
export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}
