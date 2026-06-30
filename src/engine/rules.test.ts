import { describe, it, expect } from 'vitest';
import type { Board } from './types';
import {
  emptyBoard,
  currentTurn,
  winner,
  isTerminal,
  legalMoves,
  applyMove,
  LINES,
} from './rules';

const X = 'X' as const;
const O = 'O' as const;
const _ = null;

/** Build a board from a 9-element literal for readable fixtures. */
function b(cells: ReadonlyArray<'X' | 'O' | null>): Board {
  return cells;
}

describe('emptyBoard', () => {
  it('returns nine null cells', () => {
    const board = emptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((c) => c === null)).toBe(true);
  });

  it('returns a fresh array each call', () => {
    expect(emptyBoard()).not.toBe(emptyBoard());
  });
});

describe('currentTurn', () => {
  it('is X on an empty board (X moves first)', () => {
    expect(currentTurn(emptyBoard())).toBe('X');
  });

  it('is O when X has one more mark than O', () => {
    expect(currentTurn(b([X, _, _, _, _, _, _, _, _]))).toBe('O');
  });

  it('is X when counts are equal', () => {
    expect(currentTurn(b([X, O, _, _, _, _, _, _, _]))).toBe('X');
  });
});

describe('winner', () => {
  it('detects all 8 winning lines for X', () => {
    for (const [a, c, d] of LINES) {
      const board = emptyBoard().slice();
      board[a] = X;
      board[c] = X;
      board[d] = X;
      expect(winner(board)).toBe('X');
    }
  });

  it('detects all 8 winning lines for O', () => {
    for (const [a, c, d] of LINES) {
      const board = emptyBoard().slice();
      board[a] = O;
      board[c] = O;
      board[d] = O;
      expect(winner(board)).toBe('O');
    }
  });

  it('returns "draw" on a full board with no line', () => {
    // X O X / X X O / O X O — full, no three-in-a-row
    expect(winner(b([X, O, X, X, X, O, O, X, O]))).toBe('draw');
  });

  it('returns null while the game is in progress', () => {
    expect(winner(emptyBoard())).toBeNull();
    expect(winner(b([X, O, _, _, _, _, _, _, _]))).toBeNull();
  });
});

describe('isTerminal', () => {
  it('is false for an empty board', () => {
    expect(isTerminal(emptyBoard())).toBe(false);
  });

  it('is true for a won board', () => {
    expect(isTerminal(b([X, X, X, _, _, _, _, _, _]))).toBe(true);
  });

  it('is true for a full draw board', () => {
    expect(isTerminal(b([X, O, X, X, X, O, O, X, O]))).toBe(true);
  });
});

describe('legalMoves', () => {
  it('lists all empty squares ascending on an empty board', () => {
    expect(legalMoves(emptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('lists only empty squares for a partial board', () => {
    expect(legalMoves(b([X, _, O, _, X, _, _, _, _]))).toEqual([1, 3, 5, 6, 7, 8]);
  });

  it('is empty when the board is terminal (won)', () => {
    expect(legalMoves(b([X, X, X, O, O, _, _, _, _]))).toEqual([]);
  });

  it('is empty when the board is a full draw', () => {
    expect(legalMoves(b([X, O, X, X, X, O, O, X, O]))).toEqual([]);
  });
});

describe('applyMove', () => {
  it('returns a new board with the mark placed', () => {
    const before = emptyBoard();
    const after = applyMove(before, 4, X);
    expect(after[4]).toBe('X');
  });

  it('does not mutate the original board (immutability)', () => {
    const before = emptyBoard();
    const snapshot = [...before];
    applyMove(before, 0, X);
    expect([...before]).toEqual(snapshot);
  });

  it('returns a distinct array reference', () => {
    const before = emptyBoard();
    expect(applyMove(before, 0, X)).not.toBe(before);
  });

  it('throws on a negative square', () => {
    expect(() => applyMove(emptyBoard(), -1, X)).toThrow();
  });

  it('throws on a square past the end', () => {
    expect(() => applyMove(emptyBoard(), 9, X)).toThrow();
  });

  it('throws on a non-integer square', () => {
    expect(() => applyMove(emptyBoard(), 1.5, X)).toThrow();
  });

  it('throws when the square is already occupied', () => {
    expect(() => applyMove(b([X, _, _, _, _, _, _, _, _]), 0, O)).toThrow();
  });

  it('throws on a malformed board (wrong length)', () => {
    expect(() => applyMove([X, O] as unknown as Board, 0, X)).toThrow();
  });

  it('throws on a board with an invalid cell value', () => {
    const bad = [X, 'Z', _, _, _, _, _, _, _] as unknown as Board;
    expect(() => applyMove(bad, 2, X)).toThrow();
  });

  it('throws on an invalid player', () => {
    expect(() => applyMove(emptyBoard(), 0, 'Z' as unknown as 'X')).toThrow();
  });
});
