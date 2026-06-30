// The 8-fold D4 symmetry group of the 3x3 board: 4 rotations + 4 reflections.
//
// Two boards are "the same" up to symmetry if one maps to the other under some
// rotation/reflection. These transforms preserve the game tree (X stays X, O
// stays O), so a board and all its symmetric images share an identical census
// and minimax verdict. Folding the futures tree by symmetry turns the 9 opening
// moves into 3 genuinely distinct choices (corner ×4, edge ×4, center ×1).

import type { Board } from './types';
import { assertValidBoard, boardKey, BOARD_SIZE } from './rules';

// Each permutation P defines a transform T where T[i] = board[P[i]] — i.e. cell
// i of the transformed board is read from cell P[i] of the source. Index layout:
//   0 1 2
//   3 4 5
//   6 7 8
export const SYMMETRIES: ReadonlyArray<readonly number[]> = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8], // identity
  [6, 3, 0, 7, 4, 1, 8, 5, 2], // rotate 90° clockwise
  [8, 7, 6, 5, 4, 3, 2, 1, 0], // rotate 180°
  [2, 5, 8, 1, 4, 7, 0, 3, 6], // rotate 270° clockwise
  [2, 1, 0, 5, 4, 3, 8, 7, 6], // mirror across the vertical axis
  [6, 7, 8, 3, 4, 5, 0, 1, 2], // mirror across the horizontal axis
  [0, 3, 6, 1, 4, 7, 2, 5, 8], // transpose (main diagonal)
  [8, 5, 2, 7, 4, 1, 6, 3, 0], // transpose (anti-diagonal)
];

/** Apply one symmetry permutation, returning a NEW board. Input is never mutated. */
export function transform(board: Board, perm: readonly number[]): Board {
  const out: Board[number][] = new Array(BOARD_SIZE);
  for (let i = 0; i < BOARD_SIZE; i++) {
    out[i] = board[perm[i]];
  }
  return out;
}

/**
 * The canonical key of a board's symmetry class: the lexicographically smallest
 * `boardKey` over all 8 transforms. Two boards are symmetry-equivalent iff they
 * share this key.
 */
export function canonicalKey(board: Board): string {
  assertValidBoard(board);
  let best: string | null = null;
  for (const perm of SYMMETRIES) {
    const key = boardKey(transform(board, perm));
    if (best === null || key < best) best = key;
  }
  return best as string;
}

/** The canonical representative board of a symmetry class (smallest `boardKey`). */
export function canonicalize(board: Board): Board {
  assertValidBoard(board);
  let bestKey: string | null = null;
  let best: Board = board;
  for (const perm of SYMMETRIES) {
    const candidate = transform(board, perm);
    const key = boardKey(candidate);
    if (bestKey === null || key < bestKey) {
      bestKey = key;
      best = candidate;
    }
  }
  return best;
}
