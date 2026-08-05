import { useCallback, useMemo, useRef } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import './FocusTextHero.css';

interface Props {
  text: string;
  /** Palabras exactas (case-sensitive) a resaltar en Verde Micelio. */
  highlightWords?: string[];
  /** Radio del lente, en px. */
  radius?: number;
}

// Actualiza --x/--y mutando el DOM directamente (sin setState) para que el
// mousemove nunca dispare un re-render de React — solo repinta el
// mask-image, que es una propiedad compositada (GPU), no de layout. El
// batching por rAF evita encolar más de una escritura de estilo por frame
// aunque el navegador dispare mousemove a mayor frecuencia.
export default function FocusTextHero({ text, highlightWords = [], radius = 180 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const nextPos = useRef<{ x: number; y: number } | null>(null);

  const words = useMemo(() => text.split(' '), [text]);
  const highlightSet = useMemo(() => new Set(highlightWords), [highlightWords]);

  const flush = useCallback(() => {
    const el = containerRef.current;
    const pos = nextPos.current;
    if (!el || !pos) return;
    el.style.setProperty('--x', `${pos.x}px`);
    el.style.setProperty('--y', `${pos.y}px`);
    rafId.current = null;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      nextPos.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(flush);
      }
    },
    [flush]
  );

  const renderWords = (layerKey: string) =>
    words.map((word, i) => (
      <span key={`${layerKey}-${i}`} className={highlightSet.has(word) ? 'ftx-highlight' : undefined}>
        {word}
        {i < words.length - 1 ? ' ' : ''}
      </span>
    ));

  return (
    <div
      ref={containerRef}
      className="ftx-hero"
      style={{ '--ftx-radius': `${radius}px` } as CSSProperties}
      onMouseMove={handleMouseMove}
    >
      <p className="ftx-layer ftx-layer--blur" aria-hidden="true">
        {renderWords('blur')}
      </p>
      <p className="ftx-layer ftx-layer--sharp">{renderWords('sharp')}</p>
    </div>
  );
}
