import type { Board } from '../../engine/types';

/** Stable string key for a board — used to key React lists and expansion state. */
export function boardKey(board: Board): string {
  return board.map((cell) => cell ?? '.').join('');
}
