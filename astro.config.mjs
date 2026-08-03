// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

// BUILD_TARGET=gh-pages activa un build estático para el preview en GitHub
// Pages (sin adapter de Cloudflare, con el base path del repo). El build de
// producción normal (sin esta variable) no cambia en nada.
const isGhPages = process.env.BUILD_TARGET === 'gh-pages';

export default defineConfig({
  site: isGhPages ? 'https://pmenenm.github.io/DOTsolutionsWEB/' : 'https://dotsolutions.io',
  base: isGhPages ? '/DOTsolutionsWEB' : '/',
  ...(isGhPages ? { output: 'static' } : { adapter: cloudflare({ imageService: 'compile' }) }),

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [sitemap(), react()],

  compressHTML: true,

  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('lenis')) return 'lenis';
          },
        },
      },
    },
    optimizeDeps: {
      include: ['gsap', 'lenis'],
    },
  },
});