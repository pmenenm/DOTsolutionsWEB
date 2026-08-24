// src/components/EpicDotPulseReveal.jsx
// Loop de marca de 7.0s con impacto cinematográfico: "dot" (real, public/dot.svg)
// se comprime en un punto bioluminiscente que emite una onda de choque —
// esa onda es la máscara radial que revela el Negro Abisal — el punto pulsa
// por la paleta y se asienta elásticamente en su posición real dentro del
// imagotipo oficial, "solutions" se revela con un barrido de luz, y todo se
// desvanece para reiniciar el ciclo desde el musgo.
//
// Nota técnica (aprendida a las malas en el componente anterior): esta
// versión de Framer Motion distorsiona fuertemente los tiempos intermedios
// cuando se usa un `ease` no-lineal (ej. 'easeInOut') sobre un `animate` con
// más de 2 keyframes. Por eso TODA animación con arreglo de `times` usa
// ease:'linear' — el efecto "elástico" se logra horneando el rebote/overshoot
// directamente en los valores de las keyframes, no en la curva de easing.
import { motion } from 'framer-motion';
import { withBase } from '../utils/paths';

const WHITE = '#FFFFFF';
const NEON = '#5DDB88';
const MOSS = '#1F6536';
const LIGHT = '#EBE9E3';
const ABYSS = '#000000';

const BG_IMAGE = withBase('/images/background_3.jpg');

// Paths oficiales de public/dot.svg (viewBox 0 0 1920 1080).
const DOTSVG_D = 'M353.87,1001.1c39.42,0,77.46-6.09,114.12-18.12,36.24-12.03,69.58-30.57,100.7-55.19,31.12-24.62,55.19-57.54,73.31-99.32,18.12-41.77,27.39-89.08,27.39-142.47V78.9h-121.17v381.49l-7.47-9.68c-4.7-5.53-13-13-25.04-22.27s-25.04-18.54-40.39-27.39c-15.35-8.85-34.86-16.18-58.93-22.27-23.65-6.09-49.24-9.27-75.66-9.27h-2.35c-97.93.97-172.21,30.57-222.7,89.63-51.04,58.93-76.08,134.59-76.08,226.43s29.19,168.48,87.28,227.4c57.96,58.51,134.17,87.7,227.82,87.7l-.97.41h.14ZM214.72,539.38c36.24-39.42,82.58-59.34,139.29-59.34s104.02,19.92,141.5,59.34c38.04,39.42,57.13,88.11,57.13,146.21s-19.09,106.79-57.13,146.62c-38.04,39.84-85.35,59.89-141.5,59.89s-103.05-19.92-139.29-59.34c-36.24-39.42-54.36-88.66-54.36-146.62s18.12-107.2,54.36-146.62v-.14Z';
const DOTSVG_O = 'M1390.32,684.62c0-86.31-31.12-160.59-92.81-222.28-61.69-61.69-135.97-92.81-222.28-92.81s-160.59,31.12-222.28,92.81c-61.69,61.69-92.81,135.97-92.81,222.28s31.12,160.59,92.81,222.28c61.69,61.69,135.97,92.81,222.28,92.81s160.59-31.12,222.28-92.81c61.69-61.69,92.81-135.97,92.81-222.28ZM1212.02,829.86c-34.86,39.01-80.23,57.96-136.94,57.96s-102.5-19.5-138.32-57.96c-35.69-39.01-53.39-87.28-53.39-145.24s17.57-106.79,53.39-145.24c35.69-39.01,81.75-57.96,138.32-57.96s102.08,19.5,136.94,57.96c34.86,38.45,52.01,87.28,52.01,145.24s-17.15,106.79-52.01,145.24Z';
const DOTSVG_T = 'M1843.19,877.16c-57.54,0-104.02-17.57-140.12-52.84-35.69-35.27-53.81-81.2-53.81-138.74V140.18h-121.17v242.2h-116.05v103.05h116.05v200.01c0,86.31,30.57,158.66,91.85,216.34,61.28,57.68,135.97,86.73,222.7,86.73v-111.35h.55Z';

const DOTSVG_SCALE = 300 / 1920;
const DOTSVG_TX = 50;
const DOTSVG_TY = (400 - 1080 * DOTSVG_SCALE) / 2;
const DOTSVG_TRANSFORM = `translate(${DOTSVG_TX},${DOTSVG_TY}) scale(${DOTSVG_SCALE})`;
// Posición real del punto de la "t" en public/dot.svg, dentro de nuestro
// lienzo 400x400 — coincide con el centro exacto de la tarjeta.
const POINT_START_X = DOTSVG_TX + (1920 * DOTSVG_SCALE) / 2;
const POINT_START_Y = DOTSVG_TY + (1080 * DOTSVG_SCALE) / 2;

// Paths oficiales de imagotipo.svg (viewBox 0 0 258 119.24).
const IMAGO_D = 'M27.25,68.96c2.85,0,5.6-.44,8.25-1.31,2.62-.87,5.03-2.21,7.28-3.99s3.99-4.16,5.3-7.18,1.98-6.44,1.98-10.3V2.29h-8.76v27.58l-.54-.7c-.34-.4-.94-.94-1.81-1.61s-1.81-1.34-2.92-1.98-2.52-1.17-4.26-1.61c-1.71-.44-3.56-.67-5.47-.67h-.17c-7.08.07-12.45,2.21-16.1,6.48-3.69,4.26-5.5,9.73-5.5,16.37s2.11,12.18,6.31,16.44c4.19,4.23,9.7,6.34,16.47,6.34l-.07.03ZM17.19,35.58c2.62-2.85,5.97-4.29,10.07-4.29s7.52,1.44,10.23,4.29c2.75,2.85,4.13,6.37,4.13,10.57s-1.38,7.72-4.13,10.6-6.17,4.33-10.23,4.33-7.45-1.44-10.07-4.29c-2.62-2.85-3.93-6.41-3.93-10.6s1.31-7.75,3.93-10.6Z';
const IMAGO_O = 'M102.18,46.08c0-6.24-2.25-11.61-6.71-16.07-4.46-4.46-9.83-6.71-16.07-6.71s-11.61,2.25-16.07,6.71c-4.46,4.46-6.71,9.83-6.71,16.07s2.25,11.61,6.71,16.07,9.83,6.71,16.07,6.71,11.61-2.25,16.07-6.71,6.71-9.83,6.71-16.07ZM89.29,56.58c-2.52,2.82-5.8,4.19-9.9,4.19s-7.41-1.41-10-4.19c-2.58-2.82-3.86-6.31-3.86-10.5s1.27-7.72,3.86-10.5c2.58-2.82,5.91-4.19,10-4.19s7.38,1.41,9.9,4.19,3.76,6.31,3.76,10.5-1.24,7.72-3.76,10.5Z';
const IMAGO_T = 'M134.92,60c-4.16,0-7.52-1.27-10.13-3.82-2.58-2.55-3.89-5.87-3.89-10.03V6.72h-8.76v17.51h-8.39v7.45h8.39v14.46c0,6.24,2.21,11.47,6.64,15.64s9.83,6.27,16.1,6.27v-8.05h.03Z';
const IMAGO_SOLUTIONS = [
  'M8.9,92.55c0-3.09,3.56-5.64,7.92-5.64,5.84,0,8.79,3.15,9.13,7.28h3.36c-.5-6.21-5-10.2-12.41-10.2-6.58,0-11.41,3.79-11.41,8.56,0,11.84,20.5,6.41,20.5,15.5,0,3.15-2.92,5.94-7.85,5.94-6.34,0-9.83-2.52-10.33-6.78h-3.36c.7,6.41,6.01,9.7,13.76,9.7,6.44,0,11.21-3.69,11.21-8.79,0-12.11-20.5-6.44-20.5-15.57Z',
  'M50.64,83.99c-9.19,0-15.64,6.91-15.64,16.47s6.44,16.47,15.64,16.47,15.57-6.98,15.57-16.47-6.41-16.47-15.57-16.47ZM50.64,113.52c-7.21,0-12.21-5.44-12.21-13.05s5-13.05,12.21-13.05,12.15,5.37,12.15,13.05-5,13.05-12.15,13.05h0Z',
  'M111.57,100.47c0,7.48-4.63,13.05-10.77,13.05s-10.94-5.5-10.94-13.05v-15.84h-3.42v15.84c0,9.43,6.07,16.47,14.39,16.47s14.06-7.01,14.06-16.47v-15.84h-3.29v15.84h-.03Z',
  'M124.92,77.18h-3.42v26.47c0,8.29,4.5,13.29,13.62,13.29v-3.29c-7.21,0-10.2-3.69-10.2-10v-15.57h10.2v-3.42h-10.2v-7.48h0Z',
  'M145.76,76.41c-1.51,0-2.48,1.07-2.48,2.52s.94,2.52,2.48,2.52,2.48-1.14,2.48-2.52-.94-2.52-2.48-2.52Z',
  'M171.83,83.99c-9.19,0-15.64,6.91-15.64,16.47s6.44,16.47,15.64,16.47,15.57-6.98,15.57-16.47-6.41-16.47-15.57-16.47ZM171.83,113.52c-7.21,0-12.21-5.44-12.21-13.05s5-13.05,12.21-13.05,12.15,5.37,12.15,13.05-5,13.05-12.15,13.05h0Z',
  'M208.2,83.99c-8.19,0-14.26,7.01-14.26,16.47v15.84h3.36v-15.84c0-7.62,4.56-13.05,10.9-13.05s10.77,5.57,10.77,13.05v15.84h3.42v-15.84c0-9.43-6.01-16.47-14.19-16.47h0Z',
  'M233.06,92.55c0-3.09,3.56-5.64,7.92-5.64,5.84,0,8.79,3.15,9.13,7.28h3.36c-.5-6.21-5-10.2-12.41-10.2-6.58,0-11.41,3.79-11.41,8.56,0,11.84,20.5,6.41,20.5,15.5,0,3.15-2.92,5.94-7.85,5.94-6.34,0-9.83-2.52-10.33-6.78h-3.36c.7,6.41,6.01,9.7,13.76,9.7,6.44,0,11.21-3.69,11.21-8.79,0-12.11-20.5-6.44-20.5-15.57h0Z',
];
const IMAGO_SOLUTIONS_RECTS = [
  { x: 74.19, y: 77.18, width: 3.29, height: 39.16 },
  { x: 144.05, y: 88.22, width: 3.42, height: 28.08 },
];

const IMAGO_SCALE = 340 / 258;
const IMAGO_TX = (400 - 258 * IMAGO_SCALE) / 2;
const IMAGO_TY = (400 - 119.24 * IMAGO_SCALE) / 2;
const IMAGO_TRANSFORM = `translate(${IMAGO_TX},${IMAGO_TY}) scale(${IMAGO_SCALE})`;
// Posición real del punto de la "t" en imagotipo.svg, en el mismo lienzo.
const POINT_END_X = IMAGO_TX + 131.3 * IMAGO_SCALE;
const POINT_END_Y = IMAGO_TY + 28 * IMAGO_SCALE;

const DURATION = 7;
const s = (seconds) => seconds / DURATION;

// Cada capa define su propio arreglo de tiempos — no hace falta forzar uno
// compartido cuando cada una cambia en momentos distintos. ease:'linear'
// siempre (ver nota arriba).
const loop = (times, values) => ({
  animate: values,
  transition: { duration: DURATION, times, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
});

// La máscara radial: nace en el punto (centro de la tarjeta) y se expande en
// círculo — el musgo desaparece "empujado" por el Negro Abisal, no con un
// fundido plano.
const bgMask = loop(
  [s(0), s(2.15), s(3.0), s(7)],
  { clipPath: ['circle(0px at 50% 50%)', 'circle(0px at 50% 50%)', 'circle(320px at 50% 50%)', 'circle(320px at 50% 50%)'] }
);
const bgZoom = loop([s(0), s(7)], { scale: [1, 1.04] });

// "dot" en public/dot.svg — Fase 1, blanco puro con sombra ambiental. Se
// comprime (fade) justo al arrancar la Fase 2 y no vuelve a aparecer: la
// Fase 3 usa el "dot" propio del imagotipo (tamaño/posición reales, junto a
// "solutions"), no una repetición del isotipo grande de la Fase 1.
const word = loop([s(0), s(2), s(2.15), s(7)], { opacity: [1, 1, 0, 0] });

// "dot" dentro del imagotipo — Fase 3, aparece ya con el punto asentado.
const imagoWord = loop(
  [s(0), s(3.8), s(4.0), s(6.4), s(7)],
  { opacity: [0, 0, 1, 1, 0] }
);

// La onda de choque: un anillo translúcido que nace en el punto y se expande
// hasta cubrir la tarjeta — dispara la máscara radial del fondo.
const SHOCKWAVE_TIMES = [s(0), s(2.15), s(2.85), s(7)];
const shockwave = loop(SHOCKWAVE_TIMES, {
  r: [0, 4, 220, 220],
  opacity: [0, 0.8, 0, 0],
});

// El punto bioluminiscente: aparece blanco, pulsa dos veces por la paleta
// (blanco→neón→musgo→blanco→neón) y se asienta elásticamente (con overshoot
// horneado en las keyframes) en su posición real dentro del imagotipo.
const POINT_TIMES = [
  s(0), s(2), s(2.15), // aparece
  s(2.4), s(2.65), s(2.9), s(3.15), // ráfaga de color x2
  s(3.55), s(3.8), // overshoot elástico -> asentado
  s(6.4), s(7), // se sostiene y se apaga
];
// El resplandor (glow) vive en el MISMO objeto que el resto de las
// propiedades del punto — spreadear dos `{animate,transition}` distintos
// sobre un solo elemento haría que el segundo pisara por completo al
// primero, perdiendo el glow.
const point = loop(POINT_TIMES, {
  opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  scale: [1, 1, 1.3, 1, 1, 1, 1, 1.12, 1, 1, 1],
  fill: [WHITE, WHITE, WHITE, NEON, MOSS, WHITE, NEON, NEON, NEON, NEON, NEON],
  cx: [
    POINT_START_X, POINT_START_X, POINT_START_X,
    POINT_START_X, POINT_START_X, POINT_START_X, POINT_START_X,
    POINT_END_X + 4, POINT_END_X,
    POINT_END_X, POINT_END_X,
  ],
  cy: [
    POINT_START_Y, POINT_START_Y, POINT_START_Y,
    POINT_START_Y, POINT_START_Y, POINT_START_Y, POINT_START_Y,
    POINT_END_Y - 6, POINT_END_Y,
    POINT_END_Y, POINT_END_Y,
  ],
  filter: [
    'drop-shadow(0 0 0px rgba(93,219,136,0))',
    'drop-shadow(0 0 0px rgba(93,219,136,0))',
    'drop-shadow(0 0 20px rgba(93,219,136,0.9))',
    'drop-shadow(0 0 45px rgba(93,219,136,0.95))',
    'drop-shadow(0 0 60px rgba(93,219,136,0.95))',
    'drop-shadow(0 0 30px rgba(93,219,136,0.9))',
    'drop-shadow(0 0 18px rgba(93,219,136,0.85))',
    'drop-shadow(0 0 18px rgba(93,219,136,0.85))',
    'drop-shadow(0 0 16px rgba(93,219,136,0.85))',
    'drop-shadow(0 0 16px rgba(93,219,136,0.85))',
    'drop-shadow(0 0 0px rgba(93,219,136,0))',
  ],
});

// "solutions" — barrido horizontal de luz desde el punto verde, ya con el
// fondo en Negro Abisal.
const WIPE_TIMES = [s(0), s(3.8), s(4.0), s(4.6), s(6.4), s(7)];
const wipe = loop(WIPE_TIMES, { width: [0, 0, 0, 400, 400, 0] });
const solutionsOpacity = loop(WIPE_TIMES, { opacity: [0, 0, 1, 1, 1, 0] });

export default function EpicDotPulseReveal() {
  return (
    <div className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-[2.5rem] relative overflow-hidden bg-[#0A0B0C] shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/10 select-none mx-auto">
      {/* Negro Abisal — siempre detrás; la máscara radial lo revela. */}
      <div className="absolute inset-0" style={{ backgroundColor: ABYSS }} />

      {/* Fase 1 — fondo orgánico con micro-zoom cinematográfico continuo. */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        {...bgZoom}
      />
      {/* La máscara radial: nace en el punto y se expande — la "onda de
          choque" empujando al musgo hacia el Negro Abisal. */}
      <motion.div className="absolute inset-0" style={{ backgroundColor: ABYSS }} {...bgMask} />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden="true">
          {/* Fase 1 — el isotipo real "dot" (public/dot.svg), grande y
              centrado, sin su propio punto: el punto vivo es el elemento
              aparte de abajo. */}
          <motion.g fill={WHITE} style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }} {...word}>
            <path d={DOTSVG_D} transform={DOTSVG_TRANSFORM} />
            <path d={DOTSVG_O} transform={DOTSVG_TRANSFORM} />
            <path d={DOTSVG_T} transform={DOTSVG_TRANSFORM} />
          </motion.g>

          {/* Fase 3 — "dot" en su tamaño/posición real dentro del imagotipo,
              junto a "solutions". */}
          <motion.g fill={LIGHT} {...imagoWord}>
            <path d={IMAGO_D} transform={IMAGO_TRANSFORM} />
            <path d={IMAGO_O} transform={IMAGO_TRANSFORM} />
            <path d={IMAGO_T} transform={IMAGO_TRANSFORM} />
          </motion.g>

          {/* La onda de choque bioluminiscente. */}
          <motion.circle cx={POINT_START_X} cy={POINT_START_Y} fill="none" stroke={NEON} strokeWidth="2" {...shockwave} />

          {/* El punto vivo — aparece, pulsa por la paleta y se asienta
              elásticamente en su posición real junto a la "t" del imagotipo. */}
          <motion.circle r="10" {...glow} {...point} />

          {/* Fase 3 — "solutions", revelada con un barrido horizontal. */}
          <motion.g fill={LIGHT} {...solutionsOpacity}>
            <defs>
              <clipPath id="solutionsWipeClip">
                <motion.rect x={IMAGO_TX} y="0" height="400" {...wipe} />
              </clipPath>
            </defs>
            <g clipPath="url(#solutionsWipeClip)">
              {IMAGO_SOLUTIONS.map((d, i) => (
                <path key={i} d={d} transform={IMAGO_TRANSFORM} />
              ))}
              {IMAGO_SOLUTIONS_RECTS.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} transform={IMAGO_TRANSFORM} />
              ))}
            </g>
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
