import { classifyMove } from '../../engine';
import type { Board, MoveQuality, Player } from '../../engine/types';

export interface MoveInfo {
  /** Sequence number of this move (history index), used to key transient UI. */
  readonly id: number;
  readonly square: number;
  readonly player: Player;
  readonly quality: MoveQuality;
}

/**
 * Diff two consecutive boards. Returns the single newly-filled square and its
 * player, or null when the boards differ by anything other than one added mark
 * (e.g. an arbitrary teleport) — in which case no move quality is meaningful.
 */
function singleMove(prev: Board, next: Board): { square: number; player: Player } | null {
  let found: { square: number; player: Player } | null = null;
  for (let i = 0; i < 9; i += 1) {
    if (prev[i] === next[i]) continue;
    if (prev[i] !== null || next[i] === null || found) return null;
    found = { square: i, player: next[i] as Player };
  }
  return found;
}

/**
 * Quality of the most recent move, derived purely from the history stack so it
 * stays correct across undo/reset/teleport. Returns null for the initial board
 * or any non-single-move transition.
 */
export function lastMoveInfo(history: readonly Board[]): MoveInfo | null {
  const i = history.length - 1;
  if (i < 1) return null;
  const move = singleMove(history[i - 1], history[i]);
  if (!move) return null;
  return {
    id: i,
    square: move.square,
    player: move.player,
    quality: classifyMove(history[i - 1], move.square),
  };
}

/**
 * Quality of the most recent move made BY `player`, walking back past the
 * opponent's replies. In Oracle mode this keeps the badge pinned to the human's
 * own move instead of flipping to the auto-opponent's reply. Returns null if a
 * teleport (non-single-move transition) is hit first, or the player hasn't moved.
 */
export function lastMoveInfoBy(history: readonly Board[], player: Player): MoveInfo | null {
  for (let i = history.length - 1; i >= 1; i -= 1) {
    const move = singleMove(history[i - 1], history[i]);
    if (!move) return null;
    if (move.player !== player) continue;
    return {
      id: i,
      square: move.square,
      player: move.player,
      quality: classifyMove(history[i - 1], move.square),
    };
  }
  return null;
}

/**
 * Consecutive 'best' moves by `player` at the tail of the game, walking back
 * until a non-best move by that player (skipping the opponent's moves). Any
 * non-single-move transition (teleport) breaks the streak.
 */
export function bestStreak(history: readonly Board[], player: Player): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 1; i -= 1) {
    const move = singleMove(history[i - 1], history[i]);
    if (!move) break;
    if (move.player !== player) continue;
    if (classifyMove(history[i - 1], move.square) !== 'best') break;
    streak += 1;
  }
  return streak;
}
