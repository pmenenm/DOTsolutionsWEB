// src/components/EpicBrandReveal.jsx
// Sting de marca en 3 actos, tal como se pidió:
//  1) [0-2s]   background_3.jpg + el isotipo real "dot" (public/dot.svg).
//  2) [2-5s]   "dot" colapsa en un único punto — una esfera blanca — que
//              crece un 40% y luego se encoge hasta desaparecer.
//  3) [5-7s]   Negro Abisal (#1B1B1B) + el imagotipo completo "dot solutions"
//              (imagotipo.svg), que aparece y se desvanece por completo.
import { motion } from 'framer-motion';
import { withBase } from '../utils/paths';

const LIGHT = '#EBE9E3'; // Bruma Digital — color del wordmark
const WHITE = '#FFFFFF'; // la "esfera blanca" del Acto 2, a propósito distinta de Bruma
const ABYSS = '#1B1B1B'; // Negro Abisal, literal (--dot-dark en theme.css)

const BG_IMAGE = withBase('/images/background_3.jpg');

// Paths oficiales de public/dot.svg (viewBox 0 0 1920 1080) — el isotipo
// "dot" aislado, tal como se usa en el resto del sitio.
const DOTSVG_D = 'M353.87,1001.1c39.42,0,77.46-6.09,114.12-18.12,36.24-12.03,69.58-30.57,100.7-55.19,31.12-24.62,55.19-57.54,73.31-99.32,18.12-41.77,27.39-89.08,27.39-142.47V78.9h-121.17v381.49l-7.47-9.68c-4.7-5.53-13-13-25.04-22.27s-25.04-18.54-40.39-27.39c-15.35-8.85-34.86-16.18-58.93-22.27-23.65-6.09-49.24-9.27-75.66-9.27h-2.35c-97.93.97-172.21,30.57-222.7,89.63-51.04,58.93-76.08,134.59-76.08,226.43s29.19,168.48,87.28,227.4c57.96,58.51,134.17,87.7,227.82,87.7l-.97.41h.14ZM214.72,539.38c36.24-39.42,82.58-59.34,139.29-59.34s104.02,19.92,141.5,59.34c38.04,39.42,57.13,88.11,57.13,146.21s-19.09,106.79-57.13,146.62c-38.04,39.84-85.35,59.89-141.5,59.89s-103.05-19.92-139.29-59.34c-36.24-39.42-54.36-88.66-54.36-146.62s18.12-107.2,54.36-146.62v-.14Z';
const DOTSVG_O = 'M1390.32,684.62c0-86.31-31.12-160.59-92.81-222.28-61.69-61.69-135.97-92.81-222.28-92.81s-160.59,31.12-222.28,92.81c-61.69,61.69-92.81,135.97-92.81,222.28s31.12,160.59,92.81,222.28c61.69,61.69,135.97,92.81,222.28,92.81s160.59-31.12,222.28-92.81c61.69-61.69,92.81-135.97,92.81-222.28ZM1212.02,829.86c-34.86,39.01-80.23,57.96-136.94,57.96s-102.5-19.5-138.32-57.96c-35.69-39.01-53.39-87.28-53.39-145.24s17.57-106.79,53.39-145.24c35.69-39.01,81.75-57.96,138.32-57.96s102.08,19.5,136.94,57.96c34.86,38.45,52.01,87.28,52.01,145.24s-17.15,106.79-52.01,145.24Z';
const DOTSVG_T = 'M1843.19,877.16c-57.54,0-104.02-17.57-140.12-52.84-35.69-35.27-53.81-81.2-53.81-138.74V140.18h-121.17v242.2h-116.05v103.05h116.05v200.01c0,86.31,30.57,158.66,91.85,216.34,61.28,57.68,135.97,86.73,222.7,86.73v-111.35h.55Z';
const DOTSVG_POINT = 'M1793.12,347.25c-48.27,0-87.28,39.01-87.28,87.28s39.01,87.28,87.28,87.28,87.28-39.01,87.28-87.28-39.01-87.28-87.28-87.28Z';

const DOTSVG_SCALE = 300 / 1920;
const DOTSVG_TX = 50;
const DOTSVG_TY = (400 - 1080 * DOTSVG_SCALE) / 2;
const DOTSVG_TRANSFORM = `translate(${DOTSVG_TX},${DOTSVG_TY}) scale(${DOTSVG_SCALE})`;
// Centro real del isotipo dentro del lienzo 400x400 — coincide con el
// centro exacto de la tarjeta: ahí es donde todo colapsa en el Acto 2.
const CENTER_X = DOTSVG_TX + (1920 * DOTSVG_SCALE) / 2;
const CENTER_Y = DOTSVG_TY + (1080 * DOTSVG_SCALE) / 2;

// Paths oficiales de imagotipo.svg (viewBox 0 0 258 119.24) — el lockup
// completo "dot solutions".
const IMAGO_D = 'M27.25,68.96c2.85,0,5.6-.44,8.25-1.31,2.62-.87,5.03-2.21,7.28-3.99s3.99-4.16,5.3-7.18,1.98-6.44,1.98-10.3V2.29h-8.76v27.58l-.54-.7c-.34-.4-.94-.94-1.81-1.61s-1.81-1.34-2.92-1.98-2.52-1.17-4.26-1.61c-1.71-.44-3.56-.67-5.47-.67h-.17c-7.08.07-12.45,2.21-16.1,6.48-3.69,4.26-5.5,9.73-5.5,16.37s2.11,12.18,6.31,16.44c4.19,4.23,9.7,6.34,16.47,6.34l-.07.03ZM17.19,35.58c2.62-2.85,5.97-4.29,10.07-4.29s7.52,1.44,10.23,4.29c2.75,2.85,4.13,6.37,4.13,10.57s-1.38,7.72-4.13,10.6-6.17,4.33-10.23,4.33-7.45-1.44-10.07-4.29c-2.62-2.85-3.93-6.41-3.93-10.6s1.31-7.75,3.93-10.6Z';
const IMAGO_O = 'M102.18,46.08c0-6.24-2.25-11.61-6.71-16.07-4.46-4.46-9.83-6.71-16.07-6.71s-11.61,2.25-16.07,6.71c-4.46,4.46-6.71,9.83-6.71,16.07s2.25,11.61,6.71,16.07,9.83,6.71,16.07,6.71,11.61-2.25,16.07-6.71,6.71-9.83,6.71-16.07ZM89.29,56.58c-2.52,2.82-5.8,4.19-9.9,4.19s-7.41-1.41-10-4.19c-2.58-2.82-3.86-6.31-3.86-10.5s1.27-7.72,3.86-10.5c2.58-2.82,5.91-4.19,10-4.19s7.38,1.41,9.9,4.19,3.76,6.31,3.76,10.5-1.24,7.72-3.76,10.5Z';
const IMAGO_T = 'M134.92,60c-4.16,0-7.52-1.27-10.13-3.82-2.58-2.55-3.89-5.87-3.89-10.03V6.72h-8.76v17.51h-8.39v7.45h8.39v14.46c0,6.24,2.21,11.47,6.64,15.64s9.83,6.27,16.1,6.27v-8.05h.03Z';
const IMAGO_POINT = 'M131.3,21.69c-3.49,0-6.31,2.82-6.31,6.31s2.82,6.31,6.31,6.31,6.31-2.82,6.31-6.31-2.82-6.31-6.31-6.31Z';
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

// Timeline — 7s exactos, tal como se pidió: Acto 1 = 2s, Acto 2 = 3s, Acto 3 = 2s.
const DURATION = 7;
const ACT1_END = 2 / DURATION;
const POINT_IN = (2 + 0.6) / DURATION; // "dot" ya colapsó en el punto
const POINT_PEAK = (2 + 1.7) / DURATION; // punto en su tamaño +40%
const ACT2_END = 5 / DURATION; // punto ya desapareció
const IMAGO_IN = (5 + 0.6) / DURATION; // imagotipo ya apareció del todo
const IMAGO_HOLD = (5 + 1.1) / DURATION; // breve respiro antes de desvanecer
const ACT3_END = 1;

const TIMES = [0, ACT1_END, POINT_IN, POINT_PEAK, ACT2_END, IMAGO_IN, IMAGO_HOLD, ACT3_END];

const cycle = () => ({
  duration: DURATION,
  times: TIMES,
  repeat: Infinity,
  repeatType: 'loop',
  ease: 'easeInOut',
});

export default function EpicBrandReveal() {
  return (
    <div className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-[2.5rem] relative overflow-hidden bg-[#0A0B0C] shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/10 select-none mx-auto">
      {/* Negro Abisal — siempre detrás; queda revelado cuando el musgo se
          desvanece justo antes del Acto 3. */}
      <div className="absolute inset-0" style={{ backgroundColor: ABYSS }} />

      {/* Acto 1 — fondo orgánico real, con un Ken Burns apenas perceptible. */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        animate={{
          scale: [1, 1.03, 1.03, 1.03, 1.03, 1.03, 1.03, 1],
          opacity: [1, 1, 1, 1, 0, 0, 0, 1],
        }}
        transition={cycle()}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(0,0,0,0.5)_100%)]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden="true">
          {/* Acto 1 — el isotipo real "dot" (public/dot.svg), tal cual. */}
          <motion.g
            fill={LIGHT}
            animate={{ opacity: [1, 1, 0, 0, 0, 0, 0, 1] }}
            transition={cycle()}
          >
            <path d={DOTSVG_D} transform={DOTSVG_TRANSFORM} />
            <path d={DOTSVG_O} transform={DOTSVG_TRANSFORM} />
            <path d={DOTSVG_T} transform={DOTSVG_TRANSFORM} />
            <path d={DOTSVG_POINT} transform={DOTSVG_TRANSFORM} />
          </motion.g>

          {/* Acto 2 — la esfera blanca: "dot" colapsa en un único punto, que
              crece un 40% y luego se encoge hasta desaparecer. Se anima el
              radio directamente (no scale/transformOrigin) para evitar
              cualquier ambigüedad de pivote con elementos SVG. */}
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill={WHITE}
            animate={{
              r: [14, 14, 14, 19.6, 0, 0, 0, 14],
              opacity: [0, 0, 1, 1, 0, 0, 0, 0],
            }}
            transition={cycle()}
          />

          {/* Acto 3 — el imagotipo completo "dot solutions", sobre Negro
              Abisal, que aparece y se desvanece del todo. */}
          <motion.g
            fill={LIGHT}
            animate={{ opacity: [0, 0, 0, 0, 0, 1, 1, 0] }}
            transition={cycle()}
          >
            <path d={IMAGO_D} transform={IMAGO_TRANSFORM} />
            <path d={IMAGO_O} transform={IMAGO_TRANSFORM} />
            <path d={IMAGO_T} transform={IMAGO_TRANSFORM} />
            <path d={IMAGO_POINT} transform={IMAGO_TRANSFORM} />
            {IMAGO_SOLUTIONS.map((d, i) => (
              <path key={i} d={d} transform={IMAGO_TRANSFORM} />
            ))}
            {IMAGO_SOLUTIONS_RECTS.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} transform={IMAGO_TRANSFORM} />
            ))}
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
