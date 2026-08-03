// Prefija rutas absolutas de assets (/logos/..., /images/...) con el BASE_URL
// del build. En producción (Cloudflare, base "/") es un no-op; en el preview
// de GitHub Pages (base "/DOTsolutionsWEB") agrega el prefijo correcto.
export function withBase(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('mailto:')) {
    return path;
  }
  if (!path.startsWith('/')) return path;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
