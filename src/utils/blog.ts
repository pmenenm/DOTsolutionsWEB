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

/** Formatea la fecha evitando el corrimiento por zona horaria (ancla al mediodía local). */
export function formatBlogDate(iso: string, lang: 'es' | 'en'): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CL' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
