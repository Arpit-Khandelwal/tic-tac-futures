import { AnimatePresence, motion } from 'framer-motion';
import type { Outcome, Player } from '../../engine/types';

interface TurnIndicatorProps {
  turn: Player;
  outcome: Outcome | null;
}

const OUTCOME_TEXT: Record<Outcome, string> = {
  X: 'X wins',
  O: 'O wins',
  draw: 'Drawn game',
};

/** Shows whose move it is, or the final result when terminal. */
export function TurnIndicator({ turn, outcome }: TurnIndicatorProps) {
  const key = outcome ?? `turn-${turn}`;
  return (
    <div className="turn">
      <span className="eyebrow">{outcome ? 'Outcome' : 'To move'}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={key}
          className="turn-value"
          data-player={outcome === 'draw' ? 'draw' : (outcome ?? turn)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {outcome ? OUTCOME_TEXT[outcome] : turn}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
