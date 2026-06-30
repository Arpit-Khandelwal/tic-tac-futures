import { useCallback, useMemo, useState } from 'react';
import {
  applyMove,
  currentTurn,
  emptyBoard,
  isTerminal,
  winner,
} from '../../engine';
import type { Board } from '../../engine/types';

export interface GameTree {
  /** The live "present" board — root of the futures tree. */
  readonly board: Board;
  /** Immutable stack of every board played/teleported to; last entry is live. */
  readonly history: readonly Board[];
  readonly turn: ReturnType<typeof currentTurn>;
  readonly outcome: ReturnType<typeof winner>;
  readonly terminal: boolean;
  readonly canUndo: boolean;
  /** Place the next mark (auto-alternating) on an empty square. */
  readonly placeMark: (square: number) => void;
  /** Teleport the present to an arbitrary reachable board and re-root. */
  readonly teleport: (board: Board) => void;
  readonly undo: () => void;
  readonly reset: () => void;
}

/**
 * Owns present-board state as an immutable history stack. The latest entry is
 * the live board; every placement and teleport pushes a new entry, so undo is
 * a single pop. Derived values (turn, outcome) come straight from the engine —
 * never duplicated into state.
 */
export function useGameTree(): GameTree {
  const [history, setHistory] = useState<readonly Board[]>(() => [emptyBoard()]);

  const board = history[history.length - 1];

  const placeMark = useCallback((square: number) => {
    setHistory((prev) => {
      const current = prev[prev.length - 1];
      if (isTerminal(current) || current[square] !== null) return prev;
      const next = applyMove(current, square, currentTurn(current));
      return [...prev, next];
    });
  }, []);

  const teleport = useCallback((target: Board) => {
    setHistory((prev) => [...prev, target]);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const reset = useCallback(() => {
    setHistory([emptyBoard()]);
  }, []);

  return useMemo(
    () => ({
      board,
      history,
      turn: currentTurn(board),
      outcome: winner(board),
      terminal: isTerminal(board),
      canUndo: history.length > 1,
      placeMark,
      teleport,
      undo,
      reset,
    }),
    [board, history, placeMark, teleport, undo, reset],
  );
}
