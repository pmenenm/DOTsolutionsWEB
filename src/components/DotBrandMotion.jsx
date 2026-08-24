// src/components/DotBrandMotion.jsx
// Loop de animación de marca: un mosaico geométrico abstracto colapsa y encaja
// en las contraformas reales de "dot" (paths oficiales de public/dot.svg),
// revela "solutions" y se dispersa de nuevo para reiniciar el ciclo.
//
// Paleta e isotipo son los reales de DOT Solutions — no inventados:
//  - Verde Bosque / Verde Neón / Carbón / Bruma son exactamente los hex de
//    --dot-forest / --dot-micelio / --dot-dark / --dot-light en theme.css.
//  - El "punto" isotipo es, literalmente, el punto de la letra "t" en el
//    isotipo real (el path circular en public/dot.svg) — la píldora verde
//    neón se contrae hasta esa geometría exacta, no una forma inventada.
import { motion } from 'framer-motion';

const COLORS = {
  forest: '#0D3518',
  neon: '#5DDB88',
  carbon: '#1B1B1B',
  mist: '#EBE9E3',
  solid: '#0E0E0E',
};

// Paths oficiales del isotipo "dot" (public/dot.svg, viewBox 0 0 1920 1080),
// reescalados a nuestro lienzo de trabajo de 400x400 para que el mosaico
// encaje con la geometría real de la marca, no una aproximación genérica.
const WORD_SCALE = 300 / 1920;
const WORD_TX = 50;
const WORD_TY = (400 - 1080 * WORD_SCALE) / 2;
const WORD_TRANSFORM = `translate(${WORD_TX},${WORD_TY}) scale(${WORD_SCALE})`;

const D_PATH =
  'M353.87,1001.1c39.42,0,77.46-6.09,114.12-18.12,36.24-12.03,69.58-30.57,100.7-55.19,31.12-24.62,55.19-57.54,73.31-99.32,18.12-41.77,27.39-89.08,27.39-142.47V78.9h-121.17v381.49l-7.47-9.68c-4.7-5.53-13-13-25.04-22.27s-25.04-18.54-40.39-27.39c-15.35-8.85-34.86-16.18-58.93-22.27-23.65-6.09-49.24-9.27-75.66-9.27h-2.35c-97.93.97-172.21,30.57-222.7,89.63-51.04,58.93-76.08,134.59-76.08,226.43s29.19,168.48,87.28,227.4c57.96,58.51,134.17,87.7,227.82,87.7l-.97.41h.14ZM214.72,539.38c36.24-39.42,82.58-59.34,139.29-59.34s104.02,19.92,141.5,59.34c38.04,39.42,57.13,88.11,57.13,146.21s-19.09,106.79-57.13,146.62c-38.04,39.84-85.35,59.89-141.5,59.89s-103.05-19.92-139.29-59.34c-36.24-39.42-54.36-88.66-54.36-146.62s18.12-107.2,54.36-146.62v-.14Z';

const O_PATH =
  'M1390.32,684.62c0-86.31-31.12-160.59-92.81-222.28-61.69-61.69-135.97-92.81-222.28-92.81s-160.59,31.12-222.28,92.81c-61.69,61.69-92.81,135.97-92.81,222.28s31.12,160.59,92.81,222.28c61.69,61.69,135.97,92.81,222.28,92.81s160.59-31.12,222.28-92.81c61.69-61.69,92.81-135.97,92.81-222.28ZM1212.02,829.86c-34.86,39.01-80.23,57.96-136.94,57.96s-102.5-19.5-138.32-57.96c-35.69-39.01-53.39-87.28-53.39-145.24s17.57-106.79,53.39-145.24c35.69-39.01,81.75-57.96,138.32-57.96s102.08,19.5,136.94,57.96c34.86,38.45,52.01,87.28,52.01,145.24s-17.15,106.79-52.01,145.24Z';

const T_PATH =
  'M1843.19,877.16c-57.54,0-104.02-17.57-140.12-52.84-35.69-35.27-53.81-81.2-53.81-138.74V140.18h-121.17v242.2h-116.05v103.05h116.05v200.01c0,86.31,30.57,158.66,91.85,216.34,61.28,57.68,135.97,86.73,222.7,86.73v-111.35h.55Z';

// Duración total del loop y quiebres de fase — tal como pide el brief:
// Fase 1: 0.0-0.8s · Fase 2: 0.8-2.0s · Fase 3: 2.0-3.2s · Fase 4: 3.2-4.2s
const DURATION = 4.2;
const T1 = 0.8 / DURATION;
const T2 = 2.0 / DURATION;
const T3 = 3.2 / DURATION;
const PHASE_TIMES = [0, T1, T2, T3, 1];

// Transición compartida: todas las formas usan el mismo reloj de 4.2s con los
// mismos quiebres de fase, así el mosaico entero se mueve como un solo
// mecanismo en vez de piezas desincronizadas.
const cycle = (ease = ['easeOut', 'easeInOut', 'easeInOut', 'easeIn']) => ({
  duration: DURATION,
  times: PHASE_TIMES,
  repeat: Infinity,
  repeatType: 'loop',
  ease,
});

export default function DotBrandMotion() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(13,53,24,0.25)]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {/* Contraformas reales de "d", "o", "t" — el mosaico sólo se hace
              visible donde coincide con esta silueta oficial. */}
          <clipPath id="dot-letters-clip">
            {/* Chromium no respeta de forma confiable un <g transform> anidado
                dentro de <clipPath> — el transform va directo en cada <path>. */}
            <path d={D_PATH} transform={WORD_TRANSFORM} />
            <path d={O_PATH} transform={WORD_TRANSFORM} />
            <path d={T_PATH} transform={WORD_TRANSFORM} />
          </clipPath>
        </defs>

        {/* Fase 2 — retícula de corte, aparece y desaparece justo cuando el
            mosaico termina de encajar. */}
        <motion.g
          stroke={COLORS.neon}
          strokeWidth="0.6"
          animate={{ opacity: [0, 0.6, 0.15, 0, 0] }}
          transition={cycle()}
        >
          <line x1="50" y1="200" x2="350" y2="200" />
          <line x1="200" y1="112" x2="200" y2="288" />
          <line x1="70" y1="112" x2="330" y2="288" />
          <line x1="330" y1="112" x2="70" y2="288" />
        </motion.g>

        {/* Formas que encajan en "d" / "o" / "t" — clip compartido a la
            silueta real del isotipo. */}
        <g clipPath="url(#dot-letters-clip)">
          {/* Semicírculo — Verde Bosque — zona de la "d" */}
          <motion.path
            d="M -1 0 A 1 1 0 0 1 1 0 Z"
            animate={{
              x: [90, 90, 105, 105, 90],
              y: [55, 55, 200, 200, 55],
              scale: [40, 40, 170, 170, 40],
              rotate: [-25, -25, 90, 90, -25],
              fill: [COLORS.forest, COLORS.forest, COLORS.forest, COLORS.solid, COLORS.forest],
            }}
            transition={cycle()}
          />

          {/* Círculo grande — Carbón — zona de la "o" */}
          <motion.circle
            r="1"
            animate={{
              x: [310, 310, 200, 200, 310],
              y: [55, 55, 200, 200, 55],
              scale: [45, 45, 100, 100, 45],
              fill: [COLORS.carbon, COLORS.carbon, COLORS.carbon, COLORS.solid, COLORS.carbon],
            }}
            transition={cycle()}
          />

          {/* Bloques — Bruma — zona de la "t" (barra superior + palo) */}
          <motion.rect
            x="-1"
            y="-1"
            width="2"
            height="2"
            animate={{
              x: [70, 70, 300, 300, 70],
              y: [320, 320, 160, 160, 320],
              scaleX: [22, 22, 55, 55, 22],
              scaleY: [14, 14, 28, 28, 14],
              rotate: [15, 15, 0, 0, 15],
              fill: [COLORS.mist, COLORS.mist, COLORS.mist, COLORS.solid, COLORS.mist],
            }}
            transition={cycle()}
          />
          <motion.rect
            x="-1"
            y="-1"
            width="2"
            height="2"
            animate={{
              x: [330, 330, 300, 300, 330],
              y: [310, 310, 235, 235, 310],
              scaleX: [16, 16, 22, 22, 16],
              scaleY: [26, 26, 55, 55, 26],
              rotate: [-20, -20, 0, 0, -20],
              fill: [COLORS.mist, COLORS.mist, COLORS.mist, COLORS.solid, COLORS.mist],
            }}
            transition={cycle()}
          />
        </g>

        {/* Píldora → punto isotipo — Verde Neón. Nunca se pinta de negro: es
            el acento exclusivo de marca (mismo criterio que --dot-micelio en
            el resto del sitio, reservado sólo para lo accionable/vivo). El
            ancho colapsa de píldora a círculo perfecto (width == height,
            rx == width/2) exactamente sobre el punto real de la "t". */}
        <motion.rect
          y="-0.35"
          height="0.7"
          rx="0.35"
          fill={COLORS.neon}
          animate={{
            attrX: [-1.2, -1.2, -0.35, -0.35, -1.2],
            width: [2.4, 2.4, 0.7, 0.7, 2.4],
            x: [200, 200, 316, 316, 200],
            y: [340, 340, 184, 184, 340],
            scale: [18, 18, 39, 39, 18],
            rotate: [10, 10, 0, 0, 10],
          }}
          transition={cycle(['easeOut', 'backOut', 'easeInOut', 'easeIn'])}
        />

        {/* Fase 4 — pulso bioluminiscente del punto, justo antes de dispersar
            el mosaico de nuevo. */}
        <motion.circle
          cx="316"
          cy="184"
          fill="none"
          stroke={COLORS.neon}
          strokeWidth="1.5"
          animate={{
            r: [0, 0, 0, 14, 46],
            opacity: [0, 0, 0, 0.6, 0],
          }}
          transition={cycle(['easeOut', 'easeOut', 'easeOut', 'easeOut'])}
        />
      </svg>

      {/* "solutions" — se revela con máscara de recorte justo debajo de
          "dot", en Fase 3, y vuelve a esconderse al dispersar en Fase 4. */}
      <div className="pointer-events-none absolute left-1/2 top-[68%] -translate-x-1/2 overflow-hidden px-1">
        <motion.span
          className="block font-['Poppins',_sans-serif] text-[10px] font-light uppercase tracking-[0.5em] text-[#0E0E0E]"
          animate={{ y: ['100%', '100%', '100%', '0%', '100%'] }}
          transition={cycle()}
        >
          solutions
        </motion.span>
      </div>
    </div>
  );
}
