// Board basics and the rules of tic-tac-toe.
//
// Board is row-major, indices 0..8:
//   0 | 1 | 2
//   3 | 4 | 5
//   6 | 7 | 8
//
// Everything here treats `Board` as readonly and never mutates it.

import type { Board, Player, Outcome } from './types';

/** The eight winning lines (rows, columns, diagonals). */
export const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const BOARD_SIZE = 9;

/** A fresh empty board: nine null cells. */
export function emptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null);
}

/**
 * Canonical memo key for a board: a 9-char string over {X, O, .}.
 *
 * `census` and `minimax` depend only on board *contents* (whose turn it is is
 * derivable from the X/O counts), so this string is a complete, collision-free
 * key for caching their results.
 *
 * A future 8-fold D4 symmetry fold slots in as a transform applied to the board
 * BEFORE this key is computed — nothing else in the engine needs to change.
 */
export function boardKey(board: Board): string {
  let key = '';
  for (const cell of board) {
    key += cell === 'X' ? 'X' : cell === 'O' ? 'O' : '.';
  }
  return key;
}

/**
 * Validate board *shape* only: length 9 with cells in {X, O, null}.
 *
 * Deliberately lenient — it does NOT enforce game reachability (count balance,
 * single-winner, etc.) so legitimate analysis fixtures (e.g. a won position fed
 * to `minimax`) are never rejected. Throws on genuinely malformed input.
 */
export function assertValidBoard(board: Board): void {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    throw new Error(`Malformed board: expected length ${BOARD_SIZE}`);
  }
  for (let i = 0; i < board.length; i++) {
    const cell = board[i];
    if (cell !== 'X' && cell !== 'O' && cell !== null) {
      throw new Error(`Malformed board: invalid cell ${String(cell)} at index ${i}`);
    }
  }
}

/** X moves first; it is X's turn when X-count === O-count, otherwise O's. */
export function currentTurn(board: Board): Player {
  let x = 0;
  let o = 0;
  for (const cell of board) {
    if (cell === 'X') x++;
    else if (cell === 'O') o++;
  }
  return x === o ? 'X' : 'O';
}

/**
 * Outcome of a board:
 *  - 'X' / 'O' if that player completes a line,
 *  - 'draw' if the board is full with no line,
 *  - null if the game is still in progress.
 */
export function winner(board: Board): Outcome | null {
  for (const [a, b, c] of LINES) {
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return mark;
    }
  }
  return board.every((cell) => cell !== null) ? 'draw' : null;
}

/** A board is terminal when it has any outcome (win or draw). */
export function isTerminal(board: Board): boolean {
  return winner(board) !== null;
}

/** Empty squares in ascending order; [] when the board is terminal. */
export function legalMoves(board: Board): number[] {
  if (isTerminal(board)) return [];
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

/**
 * Return a NEW board with `player` placed at `square`. The input is never
 * mutated. Throws on an out-of-range square, an occupied square, an invalid
 * player, or a malformed board.
 */
export function applyMove(board: Board, square: number, player: Player): Board {
  assertValidBoard(board);
  if (player !== 'X' && player !== 'O') {
    throw new Error(`Illegal player: ${String(player)}`);
  }
  if (!Number.isInteger(square) || square < 0 || square >= BOARD_SIZE) {
    throw new Error(`Illegal move: square ${square} out of range 0..${BOARD_SIZE - 1}`);
  }
  if (board[square] !== null) {
    throw new Error(`Illegal move: square ${square} is already occupied`);
  }
  const next = board.slice();
  next[square] = player;
  return next;
}
