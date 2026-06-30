import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

interface RollingNumberProps {
  value: number;
}

const DURATION = 0.55;

function format(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/**
 * Count-up animation for census tallies. The tween writes the formatted integer
 * straight to the DOM node (framer's `animate` driver) rather than through React
 * state — so it never schedules updates outside `act` in tests, and the rendered
 * text is always the real, current value. Snaps instantly under reduced motion.
 */
export function RollingNumber({ value }: RollingNumberProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const node = ref.current;
    const from = fromRef.current;
    fromRef.current = value;
    if (!node) return;
    if (reduce || from === value) {
      node.textContent = format(value);
      return;
    }
    const controls = animate(from, value, {
      duration: DURATION,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span className="tnum" ref={ref}>
      {format(value)}
    </span>
  );
}
