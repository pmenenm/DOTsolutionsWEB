// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

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
    // Tailwind sólo se usa en DotBrandMotion.jsx y su página de preview — el
    // plugin sólo genera CSS para los archivos que efectivamente importan
    // "tailwindcss", así que no toca el CSS vanilla del resto del sitio.
    plugins: [tailwindcss()],
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
    // Los sub-paths de gsap (ScrollTrigger, TextPlugin, MorphSVGPlugin) no se
    // detectan en el escaneo inicial de Vite (sólo `import gsap from 'gsap'`
    // lo dispara) — sin listarlos acá quedan afuera del pre-bundle y Vite los
    // optimiza recién al primer pedido, en caliente; si esa optimización
    // tarda o el caché queda desincronizado, el request cuelga con 504 y,
    // al ser un import estático, tira abajo en silencio TODO el script que
    // lo importa (sin animaciones, sin excepción visible en consola).
    optimizeDeps: {
      include: ['gsap', 'lenis', 'gsap/ScrollTrigger', 'gsap/TextPlugin', 'gsap/MorphSVGPlugin'],
    },
  },

  // Solo afecta a `astro dev` (nunca al build de producción) — permite
  // acceder al dev server a través de un túnel público (ej. localtunnel)
  // sin que se rechace el Host header por no ser localhost.
  server: {
    allowedHosts: true,
  },
});
