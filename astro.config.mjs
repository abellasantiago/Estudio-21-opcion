// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// IMPORTANTE: cambiá `site` por el dominio real de producción.
// Se usa para canonical, sitemap.xml y las URLs absolutas de Open Graph.
const SITE = 'https://estudio21arq.com'; // PENDIENTE: dominio definitivo

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  // Las imágenes se optimizan con sharp (AVIF + WebP) vía <Image>/<Picture>.
});
