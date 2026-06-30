import { motion } from 'framer-motion';
import type { Outcome } from '../../engine/types';
import { cellCenter } from '../lib/lines';

interface WinLineProps {
  line: readonly [number, number, number];
  winner: Outcome;
}

/**
 * Animated sweep across the winning three-in-a-row. Rendered as an absolutely
 * positioned SVG overlay (viewBox matches the 3x3 grid) so it never affects
 * board layout. The stroke draws in via pathLength (transform-equivalent).
 */
export function WinLine({ line, winner }: WinLineProps) {
  const a = cellCenter(line[0]);
  const c = cellCenter(line[2]);
  // Extend the segment slightly past the end cells for a confident sweep.
  const dx = c.x - a.x;
  const dy = c.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ext = 0.28;
  const x1 = a.x - (dx / len) * ext;
  const y1 = a.y - (dy / len) * ext;
  const x2 = c.x + (dx / len) * ext;
  const y2 = c.y + (dy / len) * ext;
  const color = winner === 'X' ? 'var(--color-x)' : 'var(--color-o)';

  return (
    <svg
      className="win-line"
      viewBox="0 0 3 3"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={0.12}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
