// Full-subtree census: enumerate EVERY complete legal game in the subtree under
// a board (no skill assumed — all legal moves are explored). Memoized by the
// canonical board key so repeated expansions across the tree are instant.

import type { Board, Census } from './types';
import {
  assertValidBoard,
  boardKey,
  currentTurn,
  applyMove,
  legalMoves,
  winner,
} from './rules';

const censusCache = new Map<string, Census>();

/**
 * Census of the full subtree under `board`: how many complete legal games end
 * in an X win, a draw, or an O win. A terminal node counts as exactly 1 toward
 * its own outcome.
 *
 * Memoized: two boards with identical cells always have identical censuses.
 */
export function census(board: Board): Census {
  assertValidBoard(board);
  const key = boardKey(board);
  const cached = censusCache.get(key);
  if (cached !== undefined) return cached;

  const result = computeCensus(board);
  censusCache.set(key, result);
  return result;
}

function computeCensus(board: Board): Census {
  // Terminal nodes stop here — crucial: we never recurse past a completed line,
  // so games do not "keep filling" after someone has already won.
  const outcome = winner(board);
  if (outcome === 'X') return { xWins: 1, draws: 0, oWins: 0, total: 1 };
  if (outcome === 'O') return { xWins: 0, draws: 0, oWins: 1, total: 1 };
  if (outcome === 'draw') return { xWins: 0, draws: 1, oWins: 0, total: 1 };

  const turn = currentTurn(board);
  let xWins = 0;
  let draws = 0;
  let oWins = 0;
  for (const move of legalMoves(board)) {
    const child = census(applyMove(board, move, turn));
    xWins += child.xWins;
    draws += child.draws;
    oWins += child.oWins;
  }
  return { xWins, draws, oWins, total: xWins + draws + oWins };
}
