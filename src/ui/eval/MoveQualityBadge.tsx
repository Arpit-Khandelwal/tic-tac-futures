import { AnimatePresence, motion } from 'framer-motion';
import type { MoveQuality } from '../../engine/types';
import type { MoveInfo } from '../game/analysis';
import './eval.css';

interface MoveQualityBadgeProps {
  move: MoveInfo | null;
}

const LABEL: Record<MoveQuality, string> = {
  best: 'Best',
  inaccuracy: 'Inaccuracy',
  blunder: 'Blunder',
};

const GLYPH: Record<MoveQuality, string> = {
  best: '★',
  inaccuracy: '!?',
  blunder: '??',
};

/**
 * Transient badge grading the most recent move. Keyed by move id so a new move
 * cross-fades a fresh badge in; AnimatePresence lets the previous one exit.
 * The label text is real (not just a color) so it reads for AT and tests.
 */
export function MoveQualityBadge({ move }: MoveQualityBadgeProps) {
  return (
    <div className="quality-slot" aria-live="polite">
      <AnimatePresence mode="wait">
        {move && (
          <motion.span
            key={move.id}
            className="quality-badge"
            data-quality={move.quality}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <span className="quality-glyph" aria-hidden="true">
              {GLYPH[move.quality]}
            </span>
            <span className="quality-text">{LABEL[move.quality]}</span>
            <span className="quality-player" data-player={move.player}>
              {move.player}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
