import type { APIRoute } from 'astro';

export const prerender = false;

/* ---------- límites y whitelists ---------- */

const LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  company: 150,
  industry: 40,
  solution: 40,
  challenge: 2000,
} as const;

type Field = keyof typeof LIMITS;

const REQUIRED: Field[] = ['firstName', 'lastName', 'email', 'company', 'industry', 'solution', 'challenge'];

// Suma máxima de longitudes crudas de todos los campos.
const MAX_PAYLOAD = 4000;

// Unión de las opciones reales de es.json + en.json (contacto.form.*Options).
// No confiar en el <select> del cliente: se valida server-side.
const INDUSTRIES = new Set([
  'Retail',
  'Gastronomía',
  'Gastronomy',
  'Agrícola',
  'Agriculture',
  'Hotelería',
  'Hospitality',
  'Minería',
  'Mining',
  'Industrial',
  'Servicios',
  'Services',
  'Otra',
  'Other',
]);

const SOLUTIONS = new Set([
  'SAP Business One',
  'RetailPro',
  'Prism',
  'TCPOS',
  'Infraestructura',
  'Infrastructure',
  'DTE',
  'Smart Order',
  'DOT Loyalty',
  'BiPyxis',
  'Otra',
  'Other',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{6,40}$/;

// El form debe llevar abierto al menos este tiempo antes de enviarse. El
// timestamp lo pone JS en el cliente (spoofeable): filtra bots sin JS y
// replay tonto; la protección fuerte sería Turnstile/WAF al deployar.
const MIN_FILL_MS = 3000;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/* ---------- rate limit in-memory ----------
   Sliding window por IP: máx 5 envíos / 10 min. En Cloudflare Workers cada
   isolate tiene su propia memoria y se recicla → este límite es best-effort;
   complementar con regla WAF de rate limiting al deployar. */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const MAP_CAP = 5000; // que el propio Map no sea vector de agotamiento de memoria

const rateMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    rateMap.set(ip, hits);
    return true;
  }
  hits.push(now);
  if (!rateMap.has(ip) && rateMap.size >= MAP_CAP) {
    const oldest = rateMap.keys().next().value;
    if (oldest !== undefined) rateMap.delete(oldest);
  }
  rateMap.set(ip, hits);
  return false;
}

/* ---------- sanitización ---------- */

// Remueve saltos de línea y NUL (anti header-injection para el futuro email)
// y recorta a max+1 para poder detectar exceso de longitud.
function cleanLine(v: unknown, max: number): string {
  return String(v ?? '')
    .replace(/[\r\n\u0000]/g, ' ')
    .trim()
    .slice(0, max + 1);
}

// El mensaje conserva \n (es un textarea); solo remueve \r y NUL.
function cleanBlock(v: unknown, max: number): string {
  return String(v ?? '')
    .replace(/[\r\u0000]/g, '')
    .trim()
    .slice(0, max + 1);
}

const success = () => Response.json({ status: 'success' });
const error = () => Response.json({ status: 'error' }, { status: 400 });

// Todos los rechazos de validación retornan el MISMO error genérico (sin
// oráculo para bots); honeypot y rate-limit retornan success falso para no
// enseñar que fueron detectados.
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error();
  }
  if (typeof body !== 'object' || body === null) return error();

  // 1. Límite de payload total (longitudes crudas de todos los valores string)
  let totalLen = 0;
  for (const v of Object.values(body)) {
    if (typeof v !== 'string') return error();
    totalLen += v.length;
  }
  if (totalLen > MAX_PAYLOAD) return error();

  // 2. Honeypot: campo invisible que los humanos nunca llenan
  if (String(body.website ?? '').trim() !== '') {
    console.log('[contacto] descartado: honeypot');
    return success();
  }

  // 3. Time-gate
  const loadedAt = Number(body.formLoadedAt);
  const elapsed = Date.now() - loadedAt;
  if (!Number.isFinite(loadedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    console.log('[contacto] descartado: time-gate');
    return success();
  }

  // 4. Rate limit por IP
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (isRateLimited(ip)) {
    console.log('[contacto] descartado: rate-limit');
    return success();
  }

  // 5. Presencia + longitud + formato + whitelists
  const data = {
    firstName: cleanLine(body.firstName, LIMITS.firstName),
    lastName: cleanLine(body.lastName, LIMITS.lastName),
    email: cleanLine(body.email, LIMITS.email),
    phone: cleanLine(body.phone, LIMITS.phone),
    company: cleanLine(body.company, LIMITS.company),
    industry: cleanLine(body.industry, LIMITS.industry),
    solution: cleanLine(body.solution, LIMITS.solution),
    challenge: cleanBlock(body.challenge, LIMITS.challenge),
  };

  for (const field of REQUIRED) {
    if (!data[field] || data[field].length > LIMITS[field]) {
      return error();
    }
  }
  if (data.phone && (data.phone.length > LIMITS.phone || !PHONE_RE.test(data.phone))) {
    return error();
  }
  if (!EMAIL_RE.test(data.email)) return error();
  if (!INDUSTRIES.has(data.industry)) return error();
  if (!SOLUTIONS.has(data.solution)) return error();

  // 6. Log con PII redactada: nunca nombre, email completo, teléfono ni el
  //    texto del mensaje.
  console.log('[contacto] solicitud válida:', {
    emailDomain: data.email.split('@')[1] ?? '?',
    company: data.company,
    industry: data.industry,
    solution: data.solution,
    challengeLength: data.challenge.length,
  });

  // TODO Resend (al deployar): escapar HTML de TODO el contenido del usuario
  // al armar el email (cleanLine ya elimina \r\n — anti header-injection —
  // pero el cuerpo HTML necesita escape propio). API key vía wrangler secret.

  return success();
};
