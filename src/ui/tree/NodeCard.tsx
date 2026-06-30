import { motion } from 'framer-motion';
import type { Census, Player } from '../../engine/types';
import type { Board as BoardType } from '../../engine/types';
import { CensusBar } from '../shared/CensusBar';
import { MiniBoard } from '../shared/MiniBoard';

interface NodeCardProps {
  board: BoardType;
  census: Census;
  move?: number | null;
  player?: Player | null;
  multiplier?: number;
  optimal?: boolean;
  showStar?: boolean;
  isRoot?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  /** When false, the node no longer teleports the present (Oracle mode). */
  teleportable?: boolean;
  /** Hover-path highlight: true = on path, false = off path, null = neutral. */
  lit?: boolean | null;
  /** Fate heatmap tint: position lean in [-1, 1]; only used when `heatmap`. */
  heatmap?: boolean;
  lean?: number;
  onTeleport: () => void;
  onToggle?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

function heatTint(lean: number): string {
  const pct = Math.round(Math.min(Math.abs(lean), 1) * 38);
  const ink = lean >= 0 ? 'var(--color-x)' : 'var(--color-o)';
  return `color-mix(in oklab, ${ink} ${pct}%, var(--color-surface-raised))`;
}

/** Presentational tree node: mini-board glyph + thin census bar + ★ + expander. */
export function NodeCard({
  board,
  census,
  move = null,
  player = null,
  multiplier,
  optimal = false,
  showStar = false,
  isRoot = false,
  hasChildren = false,
  expanded = false,
  teleportable = true,
  lit = null,
  heatmap = false,
  lean = 0,
  onTeleport,
  onToggle,
  onHoverStart,
  onHoverEnd,
}: NodeCardProps) {
  const moveLabel = isRoot ? 'Present' : `${player} → ${cellName(move)}`;
  const folded = typeof multiplier === 'number' && multiplier > 1;
  const ariaLabel = teleportable
    ? `teleport to position ${moveLabel}`
    : `position ${moveLabel}`;
  const heatStyle = heatmap
    ? ({ background: heatTint(lean) } as React.CSSProperties)
    : undefined;

  return (
    <motion.div
      layout="position"
      className={`node-card${isRoot ? ' node-card--root' : ''}${
        optimal && showStar ? ' node-card--optimal' : ''
      }`}
      style={heatStyle}
      data-lit={lit === null ? undefined : lit}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <button
        type="button"
        className="node-main"
        onClick={teleportable ? onTeleport : undefined}
        data-static={!teleportable}
        aria-label={ariaLabel}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
      >
        <MiniBoard board={board} highlight={move} />
        <div className="node-body">
          <span className="node-move">
            {moveLabel}
            {folded && (
              <span
                className="node-mult"
                aria-label={`represents ${multiplier} symmetric moves`}
              >
                ×{multiplier}
              </span>
            )}
            {showStar && optimal && (
              <span className="node-star" aria-label="optimal move">
                ★
              </span>
            )}
          </span>
          <CensusBar census={census} />
        </div>
      </button>
      {hasChildren && onToggle && (
        <button
          type="button"
          className="node-expand"
          aria-expanded={expanded}
          aria-label={expanded ? 'collapse futures' : 'expand futures'}
          onClick={onToggle}
        >
          <motion.span
            className="node-chevron"
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            ▸
          </motion.span>
        </button>
      )}
    </motion.div>
  );
}

const CELL_NAMES = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

function cellName(move: number | null): string {
  return move === null ? '' : CELL_NAMES[move];
}
