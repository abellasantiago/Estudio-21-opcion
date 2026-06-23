# Fotos de proyectos

Tirá las imágenes acá y aparecen solas (no hace falta tocar el `.md` del proyecto):

```
src/assets/proyectos/<slug>/portada.jpg      -> portada (imagen grande)
src/assets/proyectos/<slug>/galeria-01.jpg   -> galería
src/assets/proyectos/<slug>/galeria-02.jpg
...
```

- Formatos aceptados: `jpg`, `jpeg`, `png`, `webp`, `avif`.
- Astro genera automáticamente AVIF + WebP + `srcset` y agrega `width`/`height`
  (sin saltos de layout / CLS).
- Si no hay `portada.*`, se usa la primera imagen de la carpeta como portada.
- La galería son todas las imágenes de la carpeta menos la portada, ordenadas por nombre.

## Slugs actuales

```
terrazas-de-italia
terrazas-de-cajal
patios-del-regimiento
cavas-de-haedo
patios-del-vitraux
patios-maldonado
```

Ejemplo: `src/assets/proyectos/terrazas-de-italia/portada.jpg`
