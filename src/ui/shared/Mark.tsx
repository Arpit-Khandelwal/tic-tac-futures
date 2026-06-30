import { motion } from 'framer-motion';
import type { Player } from '../../engine/types';

interface MarkProps {
  player: Player;
  /** Disable the draw-in animation (used for static glyphs in tree nodes). */
  animate?: boolean;
}

const STROKE = 12;

/**
 * Crisp geometric X / O glyph drawn as SVG paths so it can stroke-draw in.
 * Color comes from the semantic palette via currentColor.
 */
export function Mark({ player, animate = true }: MarkProps) {
  const color = player === 'X' ? 'var(--color-x)' : 'var(--color-o)';
  const draw = animate
    ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 } }
    : { initial: false as const, animate: { pathLength: 1, opacity: 1 } };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <g
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        style={{ color }}
      >
        {player === 'X' ? (
          <>
            <motion.path
              d="M28 28 L72 72"
              {...draw}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M72 28 L28 72"
              {...draw}
              transition={{ duration: 0.28, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </>
        ) : (
          <motion.circle
            cx="50"
            cy="50"
            r="24"
            {...draw}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </g>
    </svg>
  );
}
