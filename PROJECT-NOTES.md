# DOTsolutionsWEB — Notas del proyecto

Sitio nuevo de DOT Solutions en Astro, reemplazando el sitio Next.js legacy (`DOTSolutions-Website-main`), con la identidad "Bioluminiscencia Corporativa".

## Stack

- **Astro 5** — SSG por defecto, i18n nativo (`es` sin prefijo, `en` con prefijo `/en`).
- **GSAP + Lenis** — motor de scroll suave y animaciones, wireado globalmente en `src/layouts/Layout.astro`.
- **React** — solo para `SubmitOrb.tsx` (indicador de carga del formulario de contacto, vía `thinking-orbs`). El resto del sitio es Astro + vanilla TS, sin Tailwind.
- **Cloudflare adapter** (`@astrojs/cloudflare`).

## Marca — "Bioluminiscencia Corporativa"

Tokens en `src/styles/theme.css`, roles estrictos (no usar fuera de su rol):

| Token | Hex | Rol |
|---|---|---|
| `--dot-dark` | `#1b1b1b` | Fondo principal oscuro |
| `--dot-gray` | `#383838` | Contenedores/tarjetas sobre fondo oscuro |
| `--dot-forest` | `#0d3518` | Fondos de sección alterna / teñido de imágenes |
| `--dot-moss` | `#1f6536` | Interactivos en reposo, bordes |
| `--dot-micelio` | `#5ddb88` | Exclusivo acción: CTAs, hover, estados activos |
| `--dot-sage` | `#b4c1a3` | Fondo claro de secciones luminosas |
| `--dot-light` | `#ebe9e3` | Texto sobre oscuro / contenedores claros |

Tipografía: **Poppins** (heading + body) en casi todo el sitio. PT Serif Italic se probó puntualmente en un par de componentes pero se revirtió — el sitio usa Poppins de forma consistente.

## Convención de motion (importante)

`ScrollTrigger` con `scrub` numérico es frágil combinado con Lenis (Lenis ya suaviza el scroll — sumarle `scrub:1` duplica el lag y se siente "atrasado"/con espacio muerto). Reglas que se siguieron en todo el proyecto:

- Reveals de una sola vez → `toggleActions: 'play none none reverse'` (sin scrub) o `IntersectionObserver` nativo.
- Si de verdad se necesita scrub (ej. `ServicesShowcase`), usar `scrub: true` (sin número), nunca `scrub: <n>`.
- Pin de scroll horizontal (scroll-jacking) se probó en `ServicesShowcase` y se descartó — le quita el control de lectura al usuario. Se reemplazó por un slider manual (flechas + avance sutil con scroll normal, sin pin).
- Siempre respetar `prefers-reduced-motion: reduce` (regla global ya en `theme.css` que neutraliza duraciones de animación/transición).

## Componentes clave (`src/components/sections/`)

- **Hero.astro** — Hard-Edge Mask Reveal del título (CSS puro, sin JS) + fades escalonados.
- **ClientLogos.astro** — marquee infinito de logos de clientes, gris con hover a blanco.
- **IndustriesTeaser.astro** — "espina dorsal" vertical (spine) que crece una vez al entrar al viewport, nodos que se iluminan en hover.
- **ServicesShowcase.astro** — "Nuestras soluciones": slider manual asimétrico (40/60), transición GSAP (fade + Hard-Edge Mask Reveal + stagger) al cambiar de panel, con avance adicional por scroll normal (sin pin).
- **Testimonials.astro** — carrusel Cover Flow (tarjeta central en foco, laterales con blur/opacidad reducida), autoplay + flechas.
- **ContactFooter.astro** — CTA + footer combinados, con "curve swipe" vía MorphSVG (`toggleActions`, no scrub).

## Mega menú (`src/components/Header.astro`)

Full-width estilo enterprise (no dropdown flotante): panel hermano de `.navbar-inner`, no hijo de `.mega` (así ocupa el 100% del ancho bajo toda la barra). 8 productos en grid de 4 columnas (SAP Business One incluido, Mobile One excluido a pedido). Logos en su color original (sin filtro grayscale), tamaños ajustados por producto vía `.mega-logo img[src*='...']`, contenedor `.mega-logo` a tamaño fijo para que título/descripción queden siempre alineados entre tarjetas.

## i18n

`src/i18n/es.json` / `en.json`, misma estructura de claves en ambos. Helper `src/i18n/utils.ts` (`useTranslations(lang)`). Los productos del mega menú viven en `nav.solutionsMenu.items`; el slider de servicios del Home en `home.servicesTeaser.items`.
