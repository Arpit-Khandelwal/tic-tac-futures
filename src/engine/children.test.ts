import { describe, it, expect } from 'vitest';
import type { Board, Census } from './types';
import { emptyBoard, legalMoves, currentTurn } from './rules';
import { minimax } from './minimax';
import { census } from './census';
import { children } from './children';

const X = 'X' as const;
const O = 'O' as const;
const _ = null;

function b(cells: ReadonlyArray<'X' | 'O' | null>): Board {
  return cells;
}

function sumCensus(nodes: ReadonlyArray<{ census: Census }>): Census {
  return nodes.reduce(
    (acc, n) => ({
      xWins: acc.xWins + n.census.xWins,
      draws: acc.draws + n.census.draws,
      oWins: acc.oWins + n.census.oWins,
      total: acc.total + n.census.total,
    }),
    { xWins: 0, draws: 0, oWins: 0, total: 0 },
  );
}

const MIDGAME: Board = b([X, O, X, X, O, O, _, _, _]);

describe('children', () => {
  it('produces one node per legal move, in move order', () => {
    const nodes = children(emptyBoard());
    expect(nodes.map((n) => n.move)).toEqual(legalMoves(emptyBoard()));
  });

  it('annotates each node with the resulting board and mover', () => {
    const nodes = children(emptyBoard());
    for (const node of nodes) {
      expect(node.player).toBe('X');
      expect(node.board[node.move]).toBe('X');
    }
  });

  it('marks the player whose turn it is as the mover (O after one X)', () => {
    const board = b([X, _, _, _, _, _, _, _, _]);
    expect(currentTurn(board)).toBe('O');
    for (const node of children(board)) {
      expect(node.player).toBe('O');
    }
  });

  it('flags isOptimal exactly for the parent minimax optimalMoves', () => {
    const optimal = new Set(minimax(MIDGAME).optimalMoves);
    for (const node of children(MIDGAME)) {
      expect(node.isOptimal).toBe(optimal.has(node.move));
    }
    // The mid-game position has a single optimal move (6).
    expect(children(MIDGAME).filter((n) => n.isOptimal).map((n) => n.move)).toEqual([6]);
  });

  it("child censuses sum to the parent's census (empty board)", () => {
    expect(sumCensus(children(emptyBoard()))).toEqual(census(emptyBoard()));
  });

  it("child censuses sum to the parent's census (mid-game)", () => {
    expect(sumCensus(children(MIDGAME))).toEqual(census(MIDGAME));
  });

  it("each child's minimax matches minimax of its board", () => {
    for (const node of children(MIDGAME)) {
      expect(node.minimax).toEqual(minimax(node.board));
    }
  });

  it('returns no children for a terminal position', () => {
    expect(children(b([X, X, X, O, O, _, _, _, _]))).toEqual([]);
  });
});
