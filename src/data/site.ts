/**
 * Datos del estudio usados en varios lugares (header, contacto, footer,
 * SEO y JSON-LD). Centralizados acá para tocar una sola vez.
 */
export const site = {
  nombre: 'Estudio 21',
  nombreLargo: 'Estudio 21 — Arquitectura y desarrollo',
  descripcion:
    'Desarrolladora boutique en Montevideo. Concebimos, construimos y entregamos cada proyecto de principio a fin. Más de 15 proyectos en más de 10 años.',
  email: 'estudiodearquitectos21@gmail.com',
  // Dirección real del estudio (no modificar).
  direccion: {
    calle: '21 de Setiembre 3024',
    ciudad: 'Montevideo',
    pais: 'Uruguay',
    paisISO: 'UY',
  },
  // Link a Google Maps por búsqueda de la dirección (sin necesidad de coordenadas).
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=21+de+Setiembre+3024+Montevideo',
  // PENDIENTE: completar si querés sumarlos al sitio.
  telefono: null as string | null, // ej. '+598 ...'
  whatsapp: '59899421576' as string | null, // sin +, para wa.me
  instagram: null as string | null, // ej. 'https://instagram.com/...'
  // Imagen por defecto para compartir (Open Graph / Twitter).
  // Banner de marca 1920×1080 (negro + tagline). Para proyectos con portada,
  // cada página usa su propia portada como imagen OG (ver ProjectLayout).
  ogImage: '/og-default.png',
} as const;
