import { useEffect, useState } from 'react';
import { legalMoves, minimax } from '../../engine';
import type { Board, Player } from '../../engine/types';
import { boardKey } from '../lib/boardKey';

export type OracleDifficulty = 'perfect' | 'random';

const THINK_MS = 450;

interface UseOracleArgs {
  board: Board;
  turn: Player;
  terminal: boolean;
  active: boolean;
  difficulty: OracleDifficulty;
  placeMark: (square: number) => void;
}

/**
 * Drives the automatic O response in "Beat the Oracle" mode. When it is O's
 * turn in a live oracle game, it waits a short "thinking" beat, then plays:
 * a `minimax` optimal move (Perfect) or a uniformly random legal move (Random).
 *
 * The effect keys on the board so each distinct position schedules exactly one
 * move, and the cleanup clears the pending timer — so a re-render, a re-root,
 * or React StrictMode's double-invoke can never produce a double O move.
 */
export function useOracle({
  board,
  turn,
  terminal,
  active,
  difficulty,
  placeMark,
}: UseOracleArgs): boolean {
  const [thinking, setThinking] = useState(false);
  const key = boardKey(board);

  useEffect(() => {
    if (!active || terminal || turn !== 'O') {
      setThinking(false);
      return;
    }
    setThinking(true);
    const moves =
      difficulty === 'perfect' ? minimax(board).optimalMoves : legalMoves(board);
    const choice = moves[Math.floor(Math.random() * moves.length)];
    const timer = setTimeout(() => {
      setThinking(false);
      placeMark(choice);
    }, THINK_MS);
    return () => clearTimeout(timer);
    // `key` captures the board identity; board/difficulty drive the choice.
  }, [key, active, terminal, turn, difficulty, placeMark, board]);

  return thinking;
}
