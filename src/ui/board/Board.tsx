import type { Board as BoardType, Outcome, Player } from '../../engine/types';
import { Celebration } from '../effects/Celebration';
import { WinLine } from '../effects/WinLine';
import { Square } from './Square';
import './board.css';

interface BoardProps {
  board: BoardType;
  nextPlayer: Player;
  terminal: boolean;
  /** Squares the minimax overlay marks as optimal (empty when overlay off). */
  optimalMoves: readonly number[];
  /** Completed three-in-a-row, when the position is won. */
  winningLine?: readonly [number, number, number] | null;
  winner?: Outcome | null;
  /** Terminal flourish; null when not terminal or suppressed by reduced motion. */
  celebration?: 'win' | 'loss' | 'draw' | null;
  onPlace: (square: number) => void;
}

export function Board({
  board,
  nextPlayer,
  terminal,
  optimalMoves,
  winningLine = null,
  winner = null,
  celebration = null,
  onPlace,
}: BoardProps) {
  const optimal = new Set(optimalMoves);
  const winning = new Set(winningLine ?? []);
  return (
    <div className="board" role="group" aria-label="present tic-tac-toe board">
      {board.map((cell, i) => (
        <Square
          key={i}
          index={i}
          cell={cell}
          nextPlayer={nextPlayer}
          disabled={terminal}
          optimal={optimal.has(i)}
          winning={winning.has(i)}
          onPlace={onPlace}
        />
      ))}
      {winningLine && winner && winner !== 'draw' && (
        <WinLine line={winningLine} winner={winner} />
      )}
      {celebration && <Celebration kind={celebration} winner={winner} />}
    </div>
  );
}
