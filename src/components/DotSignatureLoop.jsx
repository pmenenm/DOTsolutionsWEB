// src/components/DotSignatureLoop.jsx
// Loop de marca de 7.0s exactos, en 3 fases:
//  1) [0.0-2.0s] background_3.jpg + /dot.svg, tal cual.
//  2) [2.0-4.0s] dot.svg colapsa en una esfera blanca que crece +40%, recorre
//     en ráfaga la paleta de marca (blanco → neón → musgo → bosque → bruma)
//     y se encoge hasta desaparecer; el fondo funde a negro en paralelo.
//  3) [4.0-7.0s] Negro Abisal puro + imagotipo.svg completo: fade in, ~2s de
//     lectura estática, fade out final (6.4s-7.0s) para reiniciar sin saltos.
import { motion } from 'framer-motion';
import { withBase } from '../utils/paths';

const DOT_SVG = withBase('/dot.svg');
const IMAGOTIPO_SVG = withBase('/logos/imagotipo.svg');
const BG_IMAGE = withBase('/images/background_3.jpg');

// Paleta oficial DOT Solutions — la ráfaga cromática de la esfera.
const WHITE = '#FFFFFF';
const NEON = '#5DDB88';
const MOSS = '#1F6536';
const FOREST = '#0D3518';
const BRUMA = '#EBE9E3';

const DURATION = 7;
const s = (seconds) => seconds / DURATION;

const loop = (times, values) => ({
  animate: values,
  transition: { duration: DURATION, times, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
});

// Fase 1 → Fase 2: dot.svg visible 0-2.0s, colapsa rápido (2.0s-2.15s).
const word = loop([s(0), s(2), s(2.15), s(7)], { opacity: [1, 1, 0, 0] });

// Fondo orgánico: pleno hasta que la esfera empieza a encogerse (3.45s),
// funde a negro absoluto justo al llegar a los 4.0s.
const bg = loop([s(0), s(3.45), s(4), s(7)], { opacity: [1, 1, 0, 0] });

// La esfera: aparece blanca (2.0-2.15s), crece a escala 1.4 (2.15-2.65s),
// ráfaga de color mientras está expandida (2.65-3.45s), se encoge y
// desaparece (3.45-4.0s).
const SPHERE_TIMES = [s(0), s(2), s(2.15), s(2.65), s(2.85), s(3.05), s(3.25), s(3.45), s(4), s(7)];
const sphere = loop(SPHERE_TIMES, {
  opacity: [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  scale: [1, 1, 1, 1.4, 1.4, 1.4, 1.4, 1.4, 0, 0],
  backgroundColor: [WHITE, WHITE, WHITE, WHITE, NEON, MOSS, FOREST, BRUMA, BRUMA, WHITE],
});

// Imagotipo completo: fade in suave (4.0-4.3s), ~2s de lectura estática,
// fade out final en los últimos 0.6s (6.4s-7.0s), tal como se pidió.
const imago = loop([s(0), s(4), s(4.3), s(6.4), s(7)], { opacity: [0, 0, 1, 1, 0] });

export default function DotSignatureLoop() {
  return (
    <div className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-[2.5rem] relative overflow-hidden bg-[#000000] flex items-center justify-center select-none shadow-2xl">
      {/* Fondo orgánico — Fase 1, funde a Negro Abisal (el bg-[#000000] del
          contenedor) camino a la Fase 3. */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        {...bg}
      />

      {/* dot.svg — Fase 1, colapsa al llegar la Fase 2. */}
      <motion.img
        src={DOT_SVG}
        alt=""
        className="absolute w-[65%] max-w-[260px]"
        {...word}
      />

      {/* La esfera — elemento de transición de la Fase 2, ráfaga cromática. */}
      <motion.div className="absolute h-10 w-10 rounded-full" {...sphere} />

      {/* imagotipo.svg — logo oficial completo, Fase 3. */}
      <motion.img
        src={IMAGOTIPO_SVG}
        alt="dot solutions"
        className="absolute w-[85%] max-w-[340px]"
        {...imago}
      />
    </div>
  );
}
