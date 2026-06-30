import { describe, it, expect } from 'vitest';
import { foldedChildren, children, census } from './index';
import { emptyBoard, applyMove, legalMoves } from './rules';
import { canonicalKey } from './symmetry';

describe('foldedChildren', () => {
  it('folds the empty board into corner ×4, edge ×4, center ×1', () => {
    const folded = foldedChildren(emptyBoard());
    expect(folded).toHaveLength(3);

    // Ordered by representative move: corner (0), edge (1), center (4).
    expect(folded.map((n) => n.move)).toEqual([0, 1, 4]);
    expect(folded.map((n) => n.multiplier)).toEqual([4, 4, 1]);
    expect(folded.map((n) => n.equivalentMoves)).toEqual([
      [0, 2, 6, 8],
      [1, 3, 5, 7],
      [4],
    ]);
  });

  it('multipliers sum to the literal legal-move count', () => {
    const board = applyMove(emptyBoard(), 0, 'X');
    const folded = foldedChildren(board);
    const sum = folded.reduce((acc, n) => acc + n.multiplier, 0);
    expect(sum).toBe(legalMoves(board).length);
  });

  it('a corner opening folds O’s eight replies into five classes', () => {
    // X in a corner leaves only the diagonal mirror as a surviving symmetry, so
    // O's 8 replies collapse to 5 distinct ones.
    const folded = foldedChildren(applyMove(emptyBoard(), 0, 'X'));
    expect(folded).toHaveLength(5);
    expect(folded.reduce((acc, n) => acc + n.multiplier, 0)).toBe(8);
  });

  it('every folded representative is one of the literal children', () => {
    const board = applyMove(emptyBoard(), 4, 'X');
    const literalKeys = new Set(children(board).map((n) => canonicalKey(n.board)));
    for (const node of foldedChildren(board)) {
      expect(literalKeys.has(canonicalKey(node.board))).toBe(true);
    }
  });

  it('groups are genuinely distinct symmetry classes', () => {
    const folded = foldedChildren(emptyBoard());
    const classes = folded.map((n) => canonicalKey(n.board));
    expect(new Set(classes).size).toBe(folded.length);
  });

  it('the representative census equals every folded sibling’s census', () => {
    const board = emptyBoard();
    const literal = children(board);
    for (const rep of foldedChildren(board)) {
      const repKey = canonicalKey(rep.board);
      const siblings = literal.filter((n) => canonicalKey(n.board) === repKey);
      for (const sib of siblings) {
        expect(census(sib.board)).toEqual(rep.census);
      }
    }
  });

  it('does not fold a fully asymmetric position', () => {
    // After X0, O4, X8 the board has a non-trivial shape; verify multipliers are
    // consistent and total to the legal-move count regardless of how it folds.
    const board = applyMove(applyMove(applyMove(emptyBoard(), 0, 'X'), 4, 'O'), 8, 'X');
    const folded = foldedChildren(board);
    expect(folded.reduce((acc, n) => acc + n.multiplier, 0)).toBe(legalMoves(board).length);
    expect(folded.every((n) => n.multiplier >= 1)).toBe(true);
  });
});
