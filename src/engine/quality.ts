// Move-quality and position-lean analysis built on top of census + minimax.

import type { Board, MoveQuality, Verdict } from './types';
import { assertValidBoard, currentTurn, applyMove } from './rules';
import { minimax } from './minimax';
import { census } from './census';

const VALUE: Record<Verdict, number> = { WIN: 2, DRAW: 1, LOSS: 0 };

/**
 * Quality of playing `square` from `board`, for the player to move.
 *
 * Compares the value the mover *could* secure with best play to the value they
 * actually leave themselves after the move. The opponent's resulting verdict is
 * inverted to the mover's perspective (WIN↔LOSS), and the tier drop is graded:
 * 0 → best, 1 → inaccuracy, 2 → blunder.
 */
export function classifyMove(board: Board, square: number): MoveQuality {
  assertValidBoard(board);
  const turn = currentTurn(board);
  const best = VALUE[minimax(board).verdict];
  const opponentVerdict = minimax(applyMove(board, square, turn)).verdict;
  const played = 2 - VALUE[opponentVerdict]; // invert opponent's perspective to the mover's
  const drop = best - played;
  if (drop <= 0) return 'best';
  if (drop === 1) return 'inaccuracy';
  return 'blunder';
}

/**
 * Census-based lean in [-1, 1]: the share of futures favouring X minus the share
 * favouring O. +1 means every remaining game is an X win, -1 every game an O win,
 * 0 perfectly balanced (or terminal with no decisive result).
 */
export function positionLean(board: Board): number {
  const c = census(board);
  return c.total === 0 ? 0 : (c.xWins - c.oWins) / c.total;
}
