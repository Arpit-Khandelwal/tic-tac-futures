import type { Board } from '../../engine/types';
import './mini-board.css';

interface MiniBoardProps {
  board: Board;
  /** Square highlighted as the move that produced this board. */
  highlight?: number | null;
}

/** Small static 3x3 glyph used inside futures-tree nodes. */
export function MiniBoard({ board, highlight = null }: MiniBoardProps) {
  return (
    <div className="mini-board" role="img" aria-label={miniBoardLabel(board)}>
      {board.map((cell, i) => (
        <div
          key={i}
          className={`mini-cell${i === highlight ? ' mini-cell--highlight' : ''}`}
        >
          {cell && <span className={`mini-mark mini-mark--${cell.toLowerCase()}`}>{cell}</span>}
        </div>
      ))}
    </div>
  );
}

function miniBoardLabel(board: Board): string {
  const filled = board.filter(Boolean).length;
  return `position after ${filled} move${filled === 1 ? '' : 's'}`;
}
