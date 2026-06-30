import { motion } from 'framer-motion';
import type { Cell, Player } from '../../engine/types';
import { Mark } from '../shared/Mark';

interface SquareProps {
  index: number;
  cell: Cell;
  nextPlayer: Player;
  disabled: boolean;
  /** Highlighted by the minimax overlay as an optimal next move. */
  optimal: boolean;
  /** Part of the completed winning three-in-a-row. */
  winning?: boolean;
  onPlace: (index: number) => void;
}

export function Square({
  index,
  cell,
  nextPlayer,
  disabled,
  optimal,
  winning = false,
  onPlace,
}: SquareProps) {
  const empty = cell === null;
  const interactive = empty && !disabled;
  const label = `square ${index}, ${cell ? cell : 'empty'}${
    optimal && empty ? ', optimal move' : ''
  }`;

  return (
    <motion.button
      type="button"
      className={`square${optimal && empty ? ' square--optimal' : ''}${
        winning ? ' square--winning' : ''
      }`}
      data-player={empty ? nextPlayer : cell}
      aria-label={label}
      disabled={!interactive}
      onClick={() => interactive && onPlace(index)}
      whileHover={interactive ? { scale: 0.97 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {cell ? (
        <span className="square-mark">
          <Mark player={cell} />
        </span>
      ) : (
        interactive && (
          <span className="square-ghost" aria-hidden="true">
            <Mark player={nextPlayer} animate={false} />
          </span>
        )
      )}
      {optimal && empty && <span className="square-star" aria-hidden="true">★</span>}
    </motion.button>
  );
}
