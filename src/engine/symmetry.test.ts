import { describe, it, expect } from 'vitest';
import { SYMMETRIES, transform, canonicalize, canonicalKey } from './symmetry';
import { boardKey, emptyBoard, applyMove } from './rules';
import { census, minimax } from './index';
import type { Board } from './types';

function fromKey(key: string): Board {
  return [...key].map((c) => (c === 'X' ? 'X' : c === 'O' ? 'O' : null));
}

describe('D4 symmetry group', () => {
  it('has exactly 8 distinct permutations', () => {
    expect(SYMMETRIES).toHaveLength(8);
    const keys = new Set(SYMMETRIES.map((p) => p.join(',')));
    expect(keys.size).toBe(8);
  });

  it('every permutation is a bijection over 0..8', () => {
    for (const perm of SYMMETRIES) {
      expect([...perm].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    }
  });

  it('transform does not mutate the input board', () => {
    const board = fromKey('XO.......');
    const copy = [...board];
    transform(board, SYMMETRIES[1]);
    expect([...board]).toEqual(copy);
  });

  it('rotate 90° sends the top-left corner to the top-right', () => {
    // X in top-left (index 0) rotated 90° clockwise lands in top-right (index 2).
    const rotated = transform(fromKey('X........'), SYMMETRIES[1]);
    expect(boardKey(rotated)).toBe('..X......');
  });
});

describe('canonicalize / canonicalKey', () => {
  it('maps all four corner openings to the same class', () => {
    const corners = [0, 2, 6, 8].map((sq) => applyMove(emptyBoard(), sq, 'X'));
    const keys = corners.map(canonicalKey);
    expect(new Set(keys).size).toBe(1);
  });

  it('maps all four edge openings to the same class', () => {
    const edges = [1, 3, 5, 7].map((sq) => applyMove(emptyBoard(), sq, 'X'));
    const keys = edges.map(canonicalKey);
    expect(new Set(keys).size).toBe(1);
  });

  it('separates corner, edge and center openings into three classes', () => {
    const corner = canonicalKey(applyMove(emptyBoard(), 0, 'X'));
    const edge = canonicalKey(applyMove(emptyBoard(), 1, 'X'));
    const center = canonicalKey(applyMove(emptyBoard(), 4, 'X'));
    expect(new Set([corner, edge, center]).size).toBe(3);
  });

  it('is idempotent and stable across a whole symmetry orbit', () => {
    const board = applyMove(applyMove(emptyBoard(), 0, 'X'), 4, 'O');
    const key = canonicalKey(board);
    for (const perm of SYMMETRIES) {
      const image = transform(board, perm);
      expect(canonicalKey(image)).toBe(key);
      expect(boardKey(canonicalize(image))).toBe(key);
    }
    // canonicalize of an already-canonical board is itself.
    expect(boardKey(canonicalize(canonicalize(board)))).toBe(key);
  });

  it('the empty board is its own canonical form', () => {
    expect(boardKey(canonicalize(emptyBoard()))).toBe('.........');
  });

  it('symmetric boards share an identical census and minimax verdict', () => {
    const board = applyMove(emptyBoard(), 0, 'X'); // corner opening
    const image = transform(board, SYMMETRIES[1]); // its 90° rotation (a different corner)
    expect(census(image)).toEqual(census(board));
    expect(minimax(image).verdict).toBe(minimax(board).verdict);
  });
});
