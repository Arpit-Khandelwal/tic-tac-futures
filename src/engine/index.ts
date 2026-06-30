// Public engine surface. Implements exactly the contract frozen in `types.ts`,
// re-exported from focused modules:
//   - rules.ts   board basics, winner, legalMoves, applyMove, currentTurn, isTerminal
//   - census.ts  memoized full-subtree enumeration
//   - minimax.ts memoized perfect-play analysis
//   - children.ts annotated tree-expand operation (+ symmetry-folded variant)
//   - symmetry.ts D4 board-symmetry canonicalization

import {
  emptyBoard,
  currentTurn,
  legalMoves,
  applyMove,
  winner,
  isTerminal,
} from './rules';
import { census } from './census';
import { minimax } from './minimax';
import { children, foldedChildren } from './children';
import { canonicalize, canonicalKey } from './symmetry';
import { classifyMove, positionLean } from './quality';
import type { Engine } from './types';

export { emptyBoard, currentTurn, legalMoves, applyMove, winner, isTerminal };
export { census };
export { minimax };
export { children, foldedChildren };
export { canonicalize, canonicalKey };
export { classifyMove, positionLean };

// Compile-time guard: the exported surface must conform exactly to the frozen
// `Engine` contract. Any signature drift breaks `bun run typecheck`.
const _contractCheck: Engine = {
  emptyBoard,
  currentTurn,
  legalMoves,
  applyMove,
  winner,
  isTerminal,
  census,
  minimax,
  children,
  canonicalize,
  foldedChildren,
  classifyMove,
  positionLean,
};
void _contractCheck;
