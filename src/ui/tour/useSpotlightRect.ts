import { useLayoutEffect, useState } from 'react';

export interface SpotlightRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Measures the current step's target (`[data-tour="…"]`) in viewport
 * coordinates, recomputing on step change and on resize/scroll. Returns null
 * when there is no target, the element is missing, or its rect is degenerate
 * (e.g. jsdom's all-zero rects) — callers then center the bubble.
 */
export function useSpotlightRect(
  target: string | null,
  open: boolean,
  step: number,
): SpotlightRect | null {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useLayoutEffect(() => {
    if (!open || !target) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) {
        setRect(null);
        return;
      }
      setRect({ x: r.left, y: r.top, width: r.width, height: r.height });
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, target, step]);

  return rect;
}
