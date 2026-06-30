import { motion } from 'framer-motion';
import type { Outcome } from '../../engine/types';

interface CelebrationProps {
  /** 'win' bursts confetti; 'draw' shows a calm ring; 'loss' renders nothing. */
  kind: 'win' | 'loss' | 'draw';
  winner: Outcome | null;
}

const PARTICLES = 18;

function particleColor(i: number, winner: Outcome | null): string {
  if (winner === 'X') return i % 2 === 0 ? 'var(--color-x)' : 'var(--color-star)';
  if (winner === 'O') return i % 2 === 0 ? 'var(--color-o)' : 'var(--color-star)';
  return 'var(--color-draw)';
}

/**
 * Tasteful win/draw flourish overlaid on the board. Win = a short confetti
 * burst; draw = a single calm expanding ring. All motion is transform/opacity.
 * The caller is responsible for suppressing this under reduced motion.
 */
export function Celebration({ kind, winner }: CelebrationProps) {
  if (kind === 'loss') return null;

  if (kind === 'draw') {
    return (
      <div className="celebration" aria-hidden="true">
        <motion.span
          className="celebration-ring"
          initial={{ scale: 0.2, opacity: 0.5 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    );
  }

  return (
    <div className="celebration" aria-hidden="true">
      <motion.span
        className="celebration-glow"
        data-winner={winner}
        initial={{ scale: 0.4, opacity: 0.6 }}
        animate={{ scale: 1.25, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
      {Array.from({ length: PARTICLES }).map((_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2;
        const dist = 70 + (i % 4) * 22;
        return (
          <motion.span
            key={i}
            className="confetti"
            style={{ background: particleColor(i, winner) }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
              scale: 0.4,
              rotate: (i % 2 === 0 ? 1 : -1) * 180,
            }}
            transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}
