// The tree's expand operation: one annotated FutureNode per legal move.

import type { Board, FutureNode, FoldedNode } from './types';
import { assertValidBoard, currentTurn, applyMove, legalMoves } from './rules';
import { census } from './census';
import { minimax } from './minimax';
import { canonicalKey } from './symmetry';

/**
 * Annotated legal next positions from `board`. Each node carries the resulting
 * board, the move and who played it, the child's full-subtree census and
 * minimax, and whether the move was optimal FOR THE PARENT position.
 *
 * Note: `isOptimal` is a property of the parent (was this move among the
 * parent's optimal choices?), not derived from the child's own verdict.
 */
export function children(board: Board): FutureNode[] {
  assertValidBoard(board);
  const turn = currentTurn(board);
  const optimal = new Set(minimax(board).optimalMoves);

  return legalMoves(board).map((move) => {
    const next = applyMove(board, move, turn);
    return {
      board: next,
      move,
      player: turn,
      census: census(next),
      minimax: minimax(next),
      isOptimal: optimal.has(move),
    };
  });
}

/**
 * Like `children`, but groups symmetry-equivalent moves into a single
 * representative carrying a `multiplier`. The representative is the group's
 * smallest-index move (closest to the board's actual orientation); results are
 * ordered by that move. Members of a group share census and minimax, so the
 * representative's annotations stand for the whole group.
 *
 * Example: `foldedChildren(emptyBoard())` returns 3 nodes — corner (×4),
 * edge (×4), center (×1).
 */
export function foldedChildren(board: Board): FoldedNode[] {
  const groups = new Map<string, FutureNode[]>();
  for (const node of children(board)) {
    const key = canonicalKey(node.board);
    const existing = groups.get(key);
    if (existing) existing.push(node);
    else groups.set(key, [node]);
  }

  const folded: FoldedNode[] = [];
  for (const group of groups.values()) {
    const representative = group.reduce((a, b) => (a.move <= b.move ? a : b));
    const equivalentMoves = group.map((n) => n.move).sort((x, y) => x - y);
    folded.push({ ...representative, multiplier: group.length, equivalentMoves });
  }
  return folded.sort((a, b) => a.move - b.move);
}
