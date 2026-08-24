// src/components/StrobePulseBrandReveal.jsx
// Loop de marca de 7.0s: calma editorial (dot.svg sobre musgo) → colapso
// elástico en una esfera de energía → ráfaga estroboscópica de 6 texturas
// reales a ~114ms cada una (shutter match-cut) → destello y colapso a Negro
// Abisal → revelación del imagotipo oficial con el punto vivo en Verde Neón
// → fade out para reiniciar el ciclo.
//
// Nota técnica: esta versión de Framer Motion distorsiona los tiempos
// intermedios de un `animate` con más de 2 keyframes si se usa un `ease` no
// lineal (ej. 'easeInOut') — por eso todo acá usa ease:'linear', y el efecto
// "elástico" se hornea directamente en los valores (overshoot), no en la
// curva de easing. Tampoco se deben spreadear dos `{animate,transition}`
// distintos sobre el mismo elemento — el segundo pisa al primero por
// completo — así que cada elemento reúne TODAS sus propiedades animadas en
// un solo objeto.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toCanvas } from 'html-to-image';
import GIF from 'gif.js/dist/gif.js';
import { withBase } from '../utils/paths';

const WHITE = '#FFFFFF';
const NEON = '#5DDB88';
const MOSS = '#1F6536';
const FOREST = '#0D3518';
const LIGHT = '#EBE9E3';
const ABYSS = '#000000';

const DOT_SVG = withBase('/dot.svg');
// El imagotipo oficial se dibuja inline (no <img>) en la Fase Final: el
// archivo real es blanco/bruma y sobre el nuevo fondo claro necesitamos
// pintarlo en Verde Bosque — algo que un <img> no permite recolorear. Los
// paths son los mismos de public/logos/imagotipo.svg (viewBox 0 0 258
// 119.24), copiados tal cual, no recreados a mano.
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
// Assets originales (1.png..6.png) pesaban 6.6-21MB cada uno a 5000px+ de
// ancho — inviables para una ráfaga de ~114ms por frame. Se optimizaron a
// public/images/strobe/*.jpg (960px, ~90-180KB c/u) sin tocar los originales.
const STROBE_IMAGES = [1, 2, 3, 4, 5, 6].map((n) => withBase(`/images/strobe/${n}.jpg`));

const DURATION = 7;
const s = (seconds) => seconds / DURATION;

const loop = (times, values) => ({
  animate: values,
  transition: { duration: DURATION, times, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
});

// --- Fase 1 [0.0s-1.8s]: escena inicial ------------------------------------
const bgZoom = loop([s(0), s(1.8), s(7)], { scale: [1, 1.03, 1] });

// dot.svg — Fase 1 estática, blanco y nítido. A los 1.8s exactos hace un
// zoom violento hacia adelante (scale 1→2.2 mientras opacity 1→0 en 0.2s),
// como si la cámara atravesara el punto blanco. Se mantiene invisible y
// congelado en ese estado (nada de interpolar hacia otro valor mientras no
// se ve — eso fue justo el bug del "fantasma") hasta que reaparece con fade
// en el cierre del loop (6.2s-7.0s).
const word = loop(
  [s(0), s(1.8), s(2.0), s(6.2), s(7)],
  {
    scale: [1, 1, 2.2, 2.2, 1],
    opacity: [1, 1, 0, 0, 1],
  }
);

// --- Fase 2 [2.0s-2.6s]: metamorfosis real + ráfaga estroboscópica --------
// 6 segmentos iguales de 100ms cubriendo 2.0s-2.6s: 1→2→3→4→5→6 (sin volver
// a 1). La capa base (1.jpg) ya viene de la Fase 1 y se ve en los huecos;
// sólo hacen falta capas de "flash" para 2,3,4,5,6.
const STROBE_START = 2.0;
const STROBE_END = 2.6;
const SEG = (STROBE_END - STROBE_START) / 6;
const flashLayer = (slotIndex) => {
  const on = STROBE_START + slotIndex * SEG;
  const off = STROBE_START + (slotIndex + 1) * SEG;
  const eps = 0.012;
  return loop(
    [s(0), s(on), s(on + eps), s(off - eps), s(off), s(7)],
    { opacity: [0, 0, 1, 1, 0, 0] }
  );
};
const flash2 = flashLayer(1);
const flash3 = flashLayer(2);
const flash4 = flashLayer(3);
const flash5 = flashLayer(4);
const flash6 = flashLayer(5);

// --- Fase 3 [2.6s-3.0s]: apagón y limpieza total ---------------------------
// La pila de fondos (musgo + ráfaga) se apaga limpio y directo a los 3.0s —
// sin destello blanco/verde de por medio, es una transición directa, no un
// efecto. Vuelve a aparecer en los últimos 0.8s (6.2s-7.0s), en fade
// simultáneo con dot.svg, para cerrar el ciclo.
const strobeStack = loop([s(0), s(STROBE_END), s(3.0), s(6.2), s(7)], { opacity: [1, 1, 0, 0, 1] });
// El fondo pasa a Bruma Digital (#EBE9E3, el tono claro real de la paleta
// DOT) — aparece junto con el apagón de la ráfaga (2.6s-3.0s) y se
// desvanece de vuelta en el cierre del loop (6.2s-7.0s).
const finalBg = loop([s(0), s(STROBE_END), s(3.0), s(6.2), s(7)], { opacity: [0, 0, 1, 1, 0] });

// La esfera: nace en el "impacto" del zoom (2.0s) con opacity 0→1 y un pulso
// elástico de escala hasta 1.3, vibra por la paleta durante la ráfaga, y a
// los 2.6s se encoge y desaparece POR COMPLETO en menos de 0.3s. De ahí
// (2.85s) hasta el final del loop (7.0s) opacity Y scale se mantienen fijos
// en 0 sin ningún otro keyframe — ese fue exactamente el bug del "fantasma"
// sobre la "t": un último keyframe con valor distinto (ej. scale:1 en 7.0s)
// hace que Framer Motion interpole hacia ese valor durante TODO el tramo
// invisible, reapareciendo a mitad de camino (justo sobre el imagotipo).
// Con el valor congelado en 0 de punta a punta, la esfera no vuelve a
// aparecer ni se superpone en ningún momento posterior.
const SPHERE_TIMES = [
  s(0), s(1.8), s(2.0), // oculta hasta el impacto del zoom
  s(2.05), s(2.1), // pulso elástico -> asentada en scale 1.3
  s(2.25), s(2.4), s(2.55), // ráfaga de color: Neón, Musgo, Bruma
  s(2.6), s(2.85), // encogimiento y desaparición total
  s(7), // congelada en 0 — nunca vuelve a aparecer
];
const sphere = loop(SPHERE_TIMES, {
  opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  scale: [0, 0, 0, 1.5, 1.3, 1.3, 1.3, 1.3, 1.3, 0, 0],
  backgroundColor: [WHITE, WHITE, WHITE, WHITE, WHITE, NEON, MOSS, LIGHT, LIGHT, LIGHT, LIGHT],
  boxShadow: [
    '0 0 0px rgba(93,219,136,0)',
    '0 0 0px rgba(93,219,136,0)',
    '0 0 0px rgba(93,219,136,0)',
    '0 0 60px rgba(255,255,255,0.95)',
    '0 0 45px rgba(93,219,136,0.9)',
    '0 0 50px rgba(93,219,136,0.9)',
    '0 0 40px rgba(93,219,136,0.85)',
    '0 0 30px rgba(93,219,136,0.8)',
    '0 0 30px rgba(93,219,136,0.8)',
    '0 0 0px rgba(93,219,136,0)',
    '0 0 0px rgba(93,219,136,0)',
  ],
});

// --- Fase 4 [3.0s-6.2s]: imagotipo oficial limpio --------------------------
// Sólo imagotipo.svg, fade-in suave y 100% estático — nada flotando encima.
const imago = loop([s(0), s(3.0), s(3.3), s(6.2), s(7)], { opacity: [0, 0, 1, 1, 0] });

// Exportación a GIF — captura EXACTAMENTE 1 ciclo (7.0s) del loop en vivo,
// cuadro a cuadro, vía html-to-image (rasteriza el DOM real) + gif.js
// (encoder por Web Worker). Se remonta la tarjeta (cambiando `key`) justo
// antes de grabar para garantizar que la captura arranca en el t=0 exacto
// de la Fase 1, no a mitad de un ciclo ya en curso.
//
// Muestreo ADAPTATIVO, no uniforme: a 18fps parejos durante los 7.0s
// completos salen ~125 cuadros de foto (musgo/ráfaga) que en GIF pesan
// ~6MB — el formato comprime muy mal contenido fotográfico, sin importar
// el ajuste de "calidad". La ráfaga (2.0s-2.6s, lo único que de verdad
// necesita fluidez) se muestrea densa; los tramos estáticos (reposo
// inicial, imagotipo sostenido) usan 1-2 cuadros con un `delay` largo — el
// GIF sigue durando 7.0s exactos, sólo que sin gastar cuadros en momentos
// donde no hay movimiento real que capturar.
const GIF_SIZE = 320;
const GIF_SCHEDULE = [
  900, 900, // reposo inicial (Fase 1, 0.0s-1.8s) — casi no hay movimiento
  100, 100, // zoom violento de dot.svg (1.8s-2.0s)
  100, 100, 100, 100, 100, 100, // ráfaga 2.0s-2.6s, 1 cuadro por imagen
  130, 130, 140, // apagón y limpieza total (2.6s-3.0s)
  300, 2900, // imagotipo: fade in + sostenido (un solo cuadro con delay largo)
  270, 270, 276, // fade out final -> vuelve a 0 = 7000ms exactos
];
const GIF_TOTAL_FRAMES = GIF_SCHEDULE.length;

export default function StrobePulseBrandReveal() {
  const cardRef = useRef(null);
  const [loopKey, setLoopKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  // Precarga forzada de la ráfaga — sin esto, el primer loop podría mostrar
  // un frame en blanco/parpadeo mientras el navegador pide cada imagen a
  // mitad de la ráfaga de 114ms.
  useEffect(() => {
    STROBE_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  async function handleDownloadGif() {
    if (isRecording) return;
    setIsRecording(true);
    setProgress(0);

    // Reinicia el componente (nuevo `key`) para que el ciclo grabado
    // arranque exactamente en la Fase 1 — no a mitad de la animación.
    setLoopKey((k) => k + 1);
    await new Promise((resolve) => setTimeout(resolve, 80));

    const node = cardRef.current;
    const frames = [];
    for (let i = 0; i < GIF_TOTAL_FRAMES; i++) {
      // OJO: `width`/`height` en html-to-image fuerzan el tamaño del NODO
      // antes de renderizar (no el tamaño de salida) — forzarlo a 320 sobre
      // un nodo de 340px desalineaba el layout del canvas final y cortaba
      // los bordes de los SVG. `canvasWidth`/`canvasHeight` sí son el
      // tamaño de salida: se captura el nodo a su tamaño real (340x340,
      // scroll siempre en 0,0 por ser un nodo fijo sin overflow) y recién
      // ahí se escala 1:1 a los 320x320 pedidos.
      const canvas = await toCanvas(node, {
        canvasWidth: GIF_SIZE,
        canvasHeight: GIF_SIZE,
        pixelRatio: 1,
        cacheBust: false,
        style: { borderRadius: '0' },
      });
      frames.push({ canvas, delay: GIF_SCHEDULE[i] });
      setProgress(Math.round(((i + 1) / GIF_TOTAL_FRAMES) * 100));
      await new Promise((resolve) => setTimeout(resolve, GIF_SCHEDULE[i]));
    }

    const gif = new GIF({
      workers: 2,
      quality: 28, // más alto = más compresión/liviano (gif.js: 1 mejor calidad, 30 peor)
      dither: false, // sin dithering: menos ruido, mejor compresión (más liviano)
      repeat: 0, // loop infinito en el gif final
      globalPalette: true, // una sola paleta de 256 colores para todo el gif, no una por cuadro
      workerScript: withBase('/gif.worker.js'),
      width: GIF_SIZE,
      height: GIF_SIZE,
    });

    frames.forEach(({ canvas, delay }) => {
      gif.addFrame(canvas, { delay, copy: true });
    });

    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dot-signature-animated.gif';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setProgress(0);
    });

    gif.render();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        key={loopKey}
        ref={cardRef}
        className="w-[340px] h-[340px] p-6 relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-black select-none shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10"
      >
        {/* Negro Abisal — base permanente. */}
        <div className="absolute inset-0" style={{ backgroundColor: ABYSS }} />

        {/* Pila de fondos: 1.jpg persistente + 5 capas de flash (2-6) que se
            encienden y apagan en su ventana de ~114ms. Todo el conjunto hace
            un micro-zoom continuo y se apaga al llegar el destello. */}
        <motion.div className="absolute inset-0" {...strobeStack}>
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[0]})` }} {...bgZoom} />
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[1]})` }} {...flash2} />
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[2]})` }} {...flash3} />
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[3]})` }} {...flash4} />
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[4]})` }} {...flash5} />
          <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STROBE_IMAGES[5]})` }} {...flash6} />
        </motion.div>

        {/* Fase 3: transición limpia y directa a Bruma Digital (no Negro
            Abisal, sin destello) — se desvanece de vuelta al cerrar el
            loop, dejando ver el musgo otra vez. */}
        <motion.div className="absolute inset-0" style={{ backgroundColor: LIGHT }} {...finalBg} />

        {/* dot.svg — Fase 1, se contrae físicamente hacia su propio centro
            (no se desvanece) al llegar la Fase 2, y reaparece con fade en
            el cierre del loop (6.2s-7.0s). Envuelto en su propia "safe
            zone" (padding + object-contain) para que la "t" nunca toque el
            borde, ni en vivo ni en la captura para el GIF/video. */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <motion.img
            src={DOT_SVG}
            alt=""
            className="max-w-[65%] w-auto h-auto object-contain mx-auto"
            {...word}
          />
        </div>

        {/* La esfera de energía bioluminiscente. */}
        <motion.div className="absolute h-10 w-10 rounded-full" style={{ opacity: 1 }} {...sphere} />

        {/* El imagotipo oficial — Fase Final, sobre fondo Bruma. Se dibuja
            inline (no <img>) para poder recolorearlo en Verde Bosque
            Profundo: el archivo real es blanco/bruma y sobre fondo claro
            necesita el contraste oscuro. Sin glow ni acentos — el punto
            usa el mismo color institucional que el resto del imagotipo,
            100% puro. Misma "safe zone" que dot.svg. */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <motion.svg viewBox="0 0 258 119.24" className="max-w-[75%] w-auto h-auto mx-auto" {...imago}>
            <g fill={FOREST}>
              <path d={IMAGO_D} />
              <path d={IMAGO_O} />
              <path d={IMAGO_T} />
              <path d={IMAGO_POINT} />
              {IMAGO_SOLUTIONS.map((d, i) => (
                <path key={i} d={d} />
              ))}
              {IMAGO_SOLUTIONS_RECTS.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} />
              ))}
            </g>
          </motion.svg>
        </div>
      </div>

      {/* Botón flotante — graba 1 ciclo completo (7.0s) y descarga el GIF
          optimizado para firma de correo (320x320, 18fps, ~125 cuadros). */}
      <button
        type="button"
        onClick={handleDownloadGif}
        disabled={isRecording}
        className="inline-flex items-center gap-2 rounded-full border border-[#5DDB88]/40 bg-black/80 px-5 py-2.5 font-['Poppins',_sans-serif] text-sm font-medium text-[#EBE9E3] shadow-[0_0_20px_rgba(93,219,136,0.15)] transition-colors hover:border-[#5DDB88] hover:text-[#5DDB88] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRecording ? `Grabando… ${progress}%` : '[ ⬇️ Descargar GIF para Firma ]'}
      </button>
    </div>
  );
}
