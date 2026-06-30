import type { Board } from '../../engine/types';

export const WIN_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** The completed three-in-a-row line on `board`, or null if none. */
export function winningLine(board: Board): readonly [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

/** Centre point of cell `index` in a 3-unit-square coordinate space (0..3). */
export function cellCenter(index: number): { x: number; y: number } {
  return { x: (index % 3) + 0.5, y: Math.floor(index / 3) + 0.5 };
}
