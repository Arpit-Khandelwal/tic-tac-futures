import { motion } from 'framer-motion';
import type { Census } from '../../engine/types';
import { censusShares, formatPercent } from '../lib/census';
import { RollingNumber } from './RollingNumber';
import './census-bar.css';

interface CensusBarProps {
  census: Census;
  /** Larger variant with numeric legend, used in the present panel. */
  detailed?: boolean;
}

const SEGMENTS = [
  { key: 'xWins', label: 'X wins', color: 'var(--color-x)' },
  { key: 'draws', label: 'Draws', color: 'var(--color-draw)' },
  { key: 'oWins', label: 'O wins', color: 'var(--color-o)' },
] as const;

const SPRING = { type: 'spring', stiffness: 260, damping: 32 } as const;

/**
 * Stacked outcome census. Each segment is a full-width layer parked with a
 * transform (translateX offset + scaleX width), transform-origin at the left
 * edge. Animating only transforms keeps every tween on the compositor.
 */
export function CensusBar({ census, detailed = false }: CensusBarProps) {
  const shares = censusShares(census);
  const counts = { xWins: census.xWins, draws: census.draws, oWins: census.oWins };

  let offset = 0;
  const layers = SEGMENTS.map((seg) => {
    const share = shares[seg.key];
    const layer = { ...seg, share, offset, count: counts[seg.key] };
    offset += share;
    return layer;
  });

  return (
    <div className={`census${detailed ? ' census--detailed' : ''}`}>
      <div
        className="census-bar"
        role="img"
        aria-label={`X ${formatPercent(shares.xWins)}, draw ${formatPercent(
          shares.draws,
        )}, O ${formatPercent(shares.oWins)}`}
      >
        {layers.map((layer) => (
          <motion.span
            key={layer.key}
            className="census-seg"
            style={{ background: layer.color, transformOrigin: '0 50%' }}
            initial={false}
            animate={{ scaleX: layer.share, x: `${layer.offset * 100}%` }}
            transition={SPRING}
          />
        ))}
      </div>
      {detailed && (
        <ul className="census-legend tnum">
          {layers.map((layer) => (
            <li key={layer.key} className="census-legend-item">
              <span className="census-swatch" style={{ background: layer.color }} />
              <span className="census-legend-label">{layer.label}</span>
              <span className="census-legend-count">
                <RollingNumber value={layer.count} />
              </span>
              <span className="census-legend-pct">{formatPercent(layer.share)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
