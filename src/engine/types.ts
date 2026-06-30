// FROZEN PUBLIC CONTRACT — shared by the engine and the UI.
// Do NOT change these type or function signatures. Both agents code against this.
//
// Board is row-major, indices 0..8:
//   0 | 1 | 2
//   3 | 4 | 5
//   6 | 7 | 8

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = readonly Cell[]; // always length 9

export type Outcome = 'X' | 'O' | 'draw';

// Verdict is always from the perspective of the player whose turn it is to move.
export type Verdict = 'WIN' | 'DRAW' | 'LOSS';

export interface Census {
  readonly xWins: number;
  readonly draws: number;
  readonly oWins: number;
  readonly total: number; // xWins + draws + oWins
}

export interface Minimax {
  readonly verdict: Verdict; // best achievable result for the player to move
  readonly optimalMoves: readonly number[]; // squares (0..8) that achieve `verdict`
}

// One annotated child position — the unit the futures tree renders and expands.
export interface FutureNode {
  readonly board: Board; // board AFTER `move` has been played
  readonly move: number; // square (0..8) played to reach `board` from its parent
  readonly player: Player; // who played `move`
  readonly census: Census; // census of the full subtree under `board`
  readonly minimax: Minimax; // minimax of `board` (perspective = player to move in `board`)
  readonly isOptimal: boolean; // was `move` an optimal choice for the parent position?
}

// A FutureNode that stands for a group of symmetry-equivalent sibling moves.
// All members of the group share an identical census and minimax (D4 symmetry
// preserves outcomes), so one representative is shown with a multiplier.
export interface FoldedNode extends FutureNode {
  readonly multiplier: number; // how many literal sibling moves this represents (>= 1)
  readonly equivalentMoves: readonly number[]; // the folded move indices, ascending (incl. representative)
}

// Quality of a move relative to perfect play, by minimax tier dropped:
//  - 'best'       achieves the best result available to the mover
//  - 'inaccuracy' drops one tier (e.g. a forced win reduced to a draw)
//  - 'blunder'    drops two tiers (a win turned into a loss)
export type MoveQuality = 'best' | 'inaccuracy' | 'blunder';

// The full engine surface the UI may use.
export interface Engine {
  emptyBoard(): Board;
  currentTurn(board: Board): Player; // X moves first; X when X-count === O-count
  legalMoves(board: Board): number[]; // empty squares ascending; [] if terminal
  applyMove(board: Board, square: number, player: Player): Board; // immutable; throws if illegal
  winner(board: Board): Outcome | null; // 'X'|'O' line; 'draw' if full no winner; null if in progress
  isTerminal(board: Board): boolean;
  census(board: Board): Census; // memoized full enumeration of the subtree
  minimax(board: Board): Minimax; // memoized optimal-play analysis
  children(board: Board): FutureNode[]; // annotated legal next positions (tree expand op)
  canonicalize(board: Board): Board; // the D4-canonical representative of `board`
  foldedChildren(board: Board): FoldedNode[]; // children grouped by board symmetry
  classifyMove(board: Board, square: number): MoveQuality; // quality of a move vs perfect play
  positionLean(board: Board): number; // census advantage in [-1, 1]: +1 all X-win futures, -1 all O-win
}
