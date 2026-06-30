import type { Player, Verdict as VerdictType } from '../../engine/types';

interface VerdictProps {
  verdict: VerdictType;
  turn: Player;
  terminal: boolean;
}

/** Phrases the minimax truth in plain language from the mover's perspective. */
function describe(verdict: VerdictType, turn: Player, terminal: boolean): string {
  if (terminal) {
    if (verdict === 'LOSS') return `${turn === 'X' ? 'O' : 'X'} played the winning line`;
    return 'No moves remain';
  }
  if (verdict === 'WIN') return `${turn} wins with perfect play`;
  if (verdict === 'LOSS') return `${turn} loses against perfect play`;
  return 'Perfect play draws';
}

export function Verdict({ verdict, turn, terminal }: VerdictProps) {
  return (
    <div className="verdict">
      <span className="eyebrow">Minimax truth</span>
      <div className="verdict-row">
        <span className="verdict-badge" data-verdict={verdict}>
          {verdict}
        </span>
        <span className="verdict-text">{describe(verdict, turn, terminal)}</span>
      </div>
    </div>
  );
}
