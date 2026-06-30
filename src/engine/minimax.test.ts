import { describe, it, expect } from 'vitest';
import type { Board } from './types';
import { emptyBoard } from './rules';
import { minimax } from './minimax';

const X = 'X' as const;
const O = 'O' as const;
const _ = null;

function b(cells: ReadonlyArray<'X' | 'O' | null>): Board {
  return cells;
}

describe('minimax — correctness anchors', () => {
  it('the empty board is a DRAW under perfect play', () => {
    expect(minimax(emptyBoard()).verdict).toBe('DRAW');
  });

  it('every opening move is optimal on the empty board (all draw)', () => {
    const { optimalMoves } = minimax(emptyBoard());
    expect([...optimalMoves].sort((a, c) => a - c)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('a completed line means the player to move has LOSS', () => {
    // X has a row; it is O's turn, and O has already lost.
    const verdict = minimax(b([X, X, X, O, O, _, _, _, _]));
    expect(verdict.verdict).toBe('LOSS');
    expect(verdict.optimalMoves).toEqual([]);
  });

  it('a terminal draw reports DRAW with no moves', () => {
    expect(minimax(b([X, O, X, X, X, O, O, X, O]))).toEqual({
      verdict: 'DRAW',
      optimalMoves: [],
    });
  });

  it('reports WIN and the winning move when a win is available in one move', () => {
    // X to move with column 0 one away at square 6.
    const result = minimax(b([X, O, X, X, O, O, _, _, _]));
    expect(result.verdict).toBe('WIN');
    expect(result.optimalMoves).toEqual([6]);
  });

  it('the player to move avoids a loss when a drawing line exists', () => {
    // O to move after X played 7 in the mid-game line: O draws by playing 6.
    const result = minimax(b([X, O, X, X, O, O, _, X, _]));
    expect(result.verdict).toBe('DRAW');
    expect(result.optimalMoves).toEqual([6]);
  });
});

describe('minimax — memoization', () => {
  it('returns the SAME cached object instance across calls (proves caching)', () => {
    expect(minimax(emptyBoard())).toBe(minimax(emptyBoard()));
  });
});
