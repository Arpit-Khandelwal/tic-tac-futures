import { describe, it, expect } from 'vitest';
import type { Board } from './types';
import { emptyBoard, legalMoves, currentTurn } from './rules';
import { minimax } from './minimax';
import { SYMMETRIES, transform } from './symmetry';
import { classifyMove, positionLean } from './quality';

const X = 'X' as const;
const O = 'O' as const;
const _ = null;

function b(cells: ReadonlyArray<'X' | 'O' | null>): Board {
  return cells;
}

// Hand-enumerated mid-game position. X to move; empties {6,7,8}.
//   X O X
//   X O O
//   . . .
// X owns column 0 (0,3) — completing it at 6 wins immediately.
// Playing 7 lets O hold the draw; playing 8 hands O column 1 (1,4,7) — a loss.
const MIDGAME: Board = b([X, O, X, X, O, O, _, _, _]);

// A non-immediate forced win. X to move; X=2, O=2.
//   X X O
//   O . .
//   . . .
// minimax: WIN with a single optimal move — center (4). 4 does NOT win on the
// spot; it sets up the forced win. 5 throws the win to a draw; 6/7/8 lose.
const FORCED_WIN: Board = b([X, X, O, O, _, _, _, _, _]);

describe('classifyMove — mid-game grading anchors', () => {
  it('grades the immediate winning move as best', () => {
    expect(classifyMove(MIDGAME, 6)).toBe('best');
  });

  it('grades a move that throws the win to a draw as inaccuracy', () => {
    expect(classifyMove(MIDGAME, 7)).toBe('inaccuracy');
  });

  it('grades a move that hands the opponent the win as blunder', () => {
    expect(classifyMove(MIDGAME, 8)).toBe('blunder');
  });
});

describe('classifyMove — empty board', () => {
  it('grades every opening move as best (all hold the draw)', () => {
    const empty = emptyBoard();
    for (const square of legalMoves(empty)) {
      expect(classifyMove(empty, square)).toBe('best');
    }
  });
});

describe('classifyMove — grades for the actual player to move (O)', () => {
  // O to move (X=2, O=1). Pins the "player to move" contract: a bug that
  // assumed X here would mis-grade every move yet still pass the X-to-move suite.
  //   X X O
  //   . . .
  //   . . .
  const O_TO_MOVE: Board = b([X, X, O, _, _, _, _, _, _]);

  it('treats this fixture as O to move', () => {
    expect(currentTurn(O_TO_MOVE)).toBe('O');
  });

  it('grades O moves across all three tiers from O perspective', () => {
    expect(classifyMove(O_TO_MOVE, 5)).toBe('best');
    expect(classifyMove(O_TO_MOVE, 4)).toBe('inaccuracy');
    expect(classifyMove(O_TO_MOVE, 3)).toBe('blunder');
  });
});

describe('classifyMove — forced win with a unique winning move', () => {
  it('confirms the fixture is a forced WIN with exactly one optimal move', () => {
    const analysis = minimax(FORCED_WIN);
    expect(analysis.verdict).toBe('WIN');
    expect(analysis.optimalMoves).toEqual([4]);
  });

  it('grades the unique winning move as best', () => {
    expect(classifyMove(FORCED_WIN, 4)).toBe('best');
  });

  it('grades a move that throws the forced win worse than best', () => {
    // Square 5 keeps a draw alive (one tier dropped from the win).
    expect(classifyMove(FORCED_WIN, 5)).toBe('inaccuracy');
  });

  it('grades non-optimal legal moves as worse than best', () => {
    const nonOptimal = legalMoves(FORCED_WIN).filter((sq) => sq !== 4);
    for (const square of nonOptimal) {
      expect(classifyMove(FORCED_WIN, square)).not.toBe('best');
    }
  });
});

describe('classifyMove — input validation (matches applyMove)', () => {
  it('throws on an occupied square', () => {
    expect(() => classifyMove(MIDGAME, 0)).toThrow(/occupied/);
  });

  it('throws on an out-of-range square', () => {
    expect(() => classifyMove(MIDGAME, 9)).toThrow(/out of range/);
    expect(() => classifyMove(MIDGAME, -1)).toThrow(/out of range/);
  });

  it('throws on a non-integer square', () => {
    expect(() => classifyMove(MIDGAME, 1.5)).toThrow(/out of range/);
  });

  it('throws on a malformed board', () => {
    expect(() => classifyMove(b([X, O]), 2)).toThrow(/Malformed board/);
  });

  it('does not mutate the input board', () => {
    const board = b([X, O, X, X, O, O, _, _, _]);
    const snapshot = [...board];
    classifyMove(board, 6);
    expect([...board]).toEqual(snapshot);
  });
});

describe('positionLean — value anchors', () => {
  it('matches the exact census lean of the empty board', () => {
    // (xWins - oWins) / total over the full game tree = (131184 - 77904) / 255168.
    expect(positionLean(emptyBoard())).toBe((131184 - 77904) / 255168);
  });

  it('is approximately 0.2088 on the empty board', () => {
    expect(positionLean(emptyBoard())).toBeCloseTo(53280 / 255168, 10);
  });

  it('is +1 on a terminal X win', () => {
    expect(positionLean(b([X, X, X, O, O, _, _, _, _]))).toBe(1);
  });

  it('is -1 on a terminal O win', () => {
    expect(positionLean(b([O, O, O, X, X, _, _, _, _]))).toBe(-1);
  });

  it('is 0 on a terminal draw', () => {
    expect(positionLean(b([X, O, X, X, X, O, O, X, O]))).toBe(0);
  });
});

describe('positionLean — invariants', () => {
  it('is invariant across a board full D4 symmetry orbit', () => {
    const board = b([X, O, X, X, O, O, _, _, _]);
    const baseline = positionLean(board);
    for (const perm of SYMMETRIES) {
      expect(positionLean(transform(board, perm))).toBe(baseline);
    }
  });

  it('stays within [-1, 1] across a representative set of boards', () => {
    const boards: Board[] = [
      emptyBoard(),
      MIDGAME,
      FORCED_WIN,
      b([X, X, X, O, O, _, _, _, _]),
      b([O, O, O, X, X, _, _, _, _]),
      b([X, O, X, X, X, O, O, X, O]),
      b([X, _, _, _, _, _, _, _, _]),
      b([_, _, _, _, X, _, _, _, _]),
      b([X, O, _, _, _, _, _, _, _]),
    ];
    for (const board of boards) {
      const lean = positionLean(board);
      expect(lean).toBeGreaterThanOrEqual(-1);
      expect(lean).toBeLessThanOrEqual(1);
    }
  });

  it('does not mutate the input board', () => {
    const board = b([X, O, X, X, O, O, _, _, _]);
    const snapshot = [...board];
    positionLean(board);
    expect([...board]).toEqual(snapshot);
  });
});
