// Perfect-play analysis. The verdict is ALWAYS from the perspective of the
// player whose turn it is to move. Memoized by canonical board key.

import type { Board, Verdict, Minimax } from './types';
import {
  assertValidBoard,
  boardKey,
  currentTurn,
  applyMove,
  legalMoves,
  winner,
} from './rules';

const minimaxCache = new Map<string, Minimax>();

const RANK: Record<Verdict, number> = { LOSS: 0, DRAW: 1, WIN: 2 };

// The result for the player to move, given the opponent's best result in the
// child position (one ply later). A child WIN for the opponent is a LOSS for us.
const INVERT: Record<Verdict, Verdict> = { WIN: 'LOSS', DRAW: 'DRAW', LOSS: 'WIN' };

/**
 * Best achievable result for the player to move under perfect play, plus every
 * move that achieves it.
 *
 * A completed line means the previous mover already won, so the player to move
 * (who has no reply) has LOSS. A full board with no line is DRAW.
 */
export function minimax(board: Board): Minimax {
  assertValidBoard(board);
  const key = boardKey(board);
  const cached = minimaxCache.get(key);
  if (cached !== undefined) return cached;

  const result = computeMinimax(board);
  minimaxCache.set(key, result);
  return result;
}

function computeMinimax(board: Board): Minimax {
  const outcome = winner(board);
  if (outcome !== null) {
    // Terminal: the player to move has no move here.
    if (outcome === 'draw') return { verdict: 'DRAW', optimalMoves: [] };
    return { verdict: 'LOSS', optimalMoves: [] };
  }

  const turn = currentTurn(board);
  let best: Verdict = 'LOSS';
  const optimalMoves: number[] = [];

  for (const move of legalMoves(board)) {
    const childVerdict = minimax(applyMove(board, move, turn)).verdict;
    const ours = INVERT[childVerdict];
    if (RANK[ours] > RANK[best]) {
      best = ours;
      optimalMoves.length = 0;
      optimalMoves.push(move);
    } else if (ours === best) {
      optimalMoves.push(move);
    }
  }

  return { verdict: best, optimalMoves };
}
