import { describe, it, expect } from 'vitest';
import type { Board } from './types';
import { emptyBoard } from './rules';
import { census } from './census';

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
// X has column-0 (0,3) one away at 6; O has column-1 (1,4) one away at 7.
// Full enumeration of all legal play yields 5 leaves:
//   move 6 -> X completes column 0 -> X win
//   move 7 -> {O@6 -> X@8 draw} + {O@8 -> X@6 X win}
//   move 8 -> {O@6 -> X@7 draw} + {O@7 O completes column 1 -> O win}
// => xWins 2, draws 2, oWins 1, total 5.
const MIDGAME: Board = b([X, O, X, X, O, O, _, _, _]);

describe('census — correctness anchors', () => {
  it('enumerates the entire game tree from the empty board', () => {
    expect(census(emptyBoard())).toEqual({
      xWins: 131184,
      draws: 46080,
      oWins: 77904,
      total: 255168,
    });
  });

  it('counts a terminal X win as exactly one X game', () => {
    expect(census(b([X, X, X, O, O, _, _, _, _]))).toEqual({
      xWins: 1,
      draws: 0,
      oWins: 0,
      total: 1,
    });
  });

  it('counts a terminal O win as exactly one O game', () => {
    expect(census(b([O, O, O, X, X, _, _, _, _]))).toEqual({
      xWins: 0,
      draws: 0,
      oWins: 1,
      total: 1,
    });
  });

  it('counts a terminal draw as exactly one drawn game', () => {
    expect(census(b([X, O, X, X, X, O, O, X, O]))).toEqual({
      xWins: 0,
      draws: 1,
      oWins: 0,
      total: 1,
    });
  });

  it('matches a hand-counted mid-game subtree', () => {
    expect(census(MIDGAME)).toEqual({
      xWins: 2,
      draws: 2,
      oWins: 1,
      total: 5,
    });
  });

  it('always reports total = xWins + draws + oWins', () => {
    const c = census(emptyBoard());
    expect(c.total).toBe(c.xWins + c.draws + c.oWins);
  });
});

describe('census — memoization', () => {
  it('returns the SAME cached object instance across calls (proves caching)', () => {
    // A non-memoized engine would return a fresh object each time; reference
    // equality only holds when the result is served from the cache.
    expect(census(emptyBoard())).toBe(census(emptyBoard()));
  });

  it('caches by board contents, not array identity', () => {
    expect(census(emptyBoard())).toBe(census(b([_, _, _, _, _, _, _, _, _])));
  });
});
