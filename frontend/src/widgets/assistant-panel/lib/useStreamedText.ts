import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/shared/lib';

const WORD_MS = 35;
const MAX_MS = 1600;

export function useStreamedText(lines: string[], enabled: boolean) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const words = lines.map((line) => line.split(/(\s+)/));
  const total = words.reduce((sum, parts) => sum + parts.length, 0);
  const animate = enabled && !reduceMotion && total > 0;
  const [shown, setShown] = useState(animate ? 0 : total);

  useEffect(() => {
    if (!animate) return;
    const step = Math.max(8, Math.min(WORD_MS, MAX_MS / total));
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(total, Math.floor((now - started) / step) + 1);
      setShown(next);
      if (next < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, total]);

  const limit = animate ? shown : total;
  const starts = words.map((_, index) => words.slice(0, index).reduce((sum, parts) => sum + parts.length, 0));
  const visible = words.map((parts, index) =>
    parts.slice(0, Math.max(0, Math.min(parts.length, limit - starts[index]))).join(''),
  );
  return { lines: visible, done: !animate || shown >= total };
}
