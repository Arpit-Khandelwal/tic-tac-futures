import type { Census } from '../../engine/types';

export interface CensusShares {
  readonly xWins: number;
  readonly draws: number;
  readonly oWins: number;
}

/** Fractional shares (0..1) of each outcome. total >= 1 always, so no guard needed. */
export function censusShares(census: Census): CensusShares {
  const { xWins, draws, oWins, total } = census;
  return {
    xWins: xWins / total,
    draws: draws / total,
    oWins: oWins / total,
  };
}

/** Compact human label, e.g. "131,184". */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
