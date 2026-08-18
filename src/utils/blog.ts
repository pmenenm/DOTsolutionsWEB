// Cada categoría del blog tiene su propio color de la paleta de marca —
// un sistema de codificación, no decoración al azar. ERP se lee como
// tecnológico (micelio), Retail como operativo/terreno (moss),
// Cumplimiento/Compliance como formal (sage), y Gastronomía/Gastronomy
// cierra la rotación de 4 colores con forest.
const CATEGORY_COLORS: Record<string, string> = {
  ERP: 'var(--dot-micelio)',
  Retail: 'var(--dot-moss)',
  Cumplimiento: 'var(--dot-sage)',
  Compliance: 'var(--dot-sage)',
  Gastronomía: 'var(--dot-forest)',
  Gastronomy: 'var(--dot-forest)',
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? 'var(--dot-micelio)';
}

// moss y forest son tonos oscuros pensados como fondo/borde sobre superficies
// CLARAS (ver comentario de cada token en theme.css) — usados tal cual como
// color de texto/ícono sobre el fondo oscuro del artículo (--dot-dark), casi
// desaparecen. Esta variante aclara esos dos con dot-light manteniendo el
// matiz, para que el acento de categoría siga siendo legible ahí.
const CATEGORY_ACCENTS_ON_DARK: Record<string, string> = {
  ERP: 'var(--dot-micelio)',
  Retail: 'color-mix(in srgb, var(--dot-moss) 55%, var(--dot-light) 45%)',
  Cumplimiento: 'var(--dot-sage)',
  Compliance: 'var(--dot-sage)',
  Gastronomía: 'color-mix(in srgb, var(--dot-forest) 40%, var(--dot-micelio) 60%)',
  Gastronomy: 'color-mix(in srgb, var(--dot-forest) 40%, var(--dot-micelio) 60%)',
};

export function categoryAccentOnDark(category: string): string {
  return CATEGORY_ACCENTS_ON_DARK[category] ?? 'var(--dot-micelio)';
}

/** Formatea la fecha evitando el corrimiento por zona horaria (ancla al mediodía local). */
export function formatBlogDate(iso: string, lang: 'es' | 'en'): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CL' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

// Fotos nuevas para el blog (carpeta public/images/novedades/) — por slug, no por índice,
// para que la imagen siga a su post aunque el orden cambie con nuevas publicaciones. Se usa
// tanto en la card del stack (Blog.astro) como en la portada del detalle (BlogPost.astro),
// así ambas quedan siempre sincronizadas. Sin entrada acá, cae al criterio de siempre
// (/blog/{slug}.jpg).
const POST_IMAGE_OVERRIDES: Record<string, string> = {
  'ecosistema-retail-que-es-y-como-se-arma': '/images/novedades/NOV1.jpg',
  'ecosistema-gastronomia-que-es-y-como-se-arma': '/images/novedades/NOV2.jpg',
  'sap-business-one-vs-s4hana': '/images/novedades/NOV3.jpeg',
  'comercio-unificado-retail': '/images/novedades/NOV4.jpg',
};

export function postImage(slug: string): string {
  return POST_IMAGE_OVERRIDES[slug] ?? `/blog/${slug}.jpg`;
}

// object-position por post — solo hace falta cuando la foto no es horizontal
// como el resto (ej. NOV1.jpg es retrato, 1080x1350): en la card del hero
// (caja ancha y baja) un center parejo recorta demasiado de los costados y
// deja afuera lo importante de la foto. Sesgar hacia arriba conserva la
// pantalla/personas y recorta el escritorio borroso de abajo, que es lo
// prescindible. Sin entrada acá, centrado normal (funciona bien en fotos
// horizontales).
const POST_IMAGE_POSITION_OVERRIDES: Record<string, string> = {
  'ecosistema-retail-que-es-y-como-se-arma': '50% 15%',
};

export function postImagePosition(slug: string): string {
  return POST_IMAGE_POSITION_OVERRIDES[slug] ?? '50% 50%';
}
