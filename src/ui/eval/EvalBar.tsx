import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './eval.css';

interface EvalBarProps {
  /** Position lean in [-1, 1]: +1 all-X futures, -1 all-O futures, 0 balanced. */
  lean: number;
}

const SPRING = { type: 'spring', stiffness: 220, damping: 30 } as const;
/** A swing this large between positions earns a brief feedback pulse. */
const SWING_THRESHOLD = 0.18;

/**
 * Slim vertical eval bar. X advantage fills from the centre upward (indigo),
 * O advantage downward (rose). The marker is positioned with a transform only,
 * keeping the tween on the compositor. Exposed as a `meter` for assistive tech
 * and as a stable, testable value. A notable lean swing flashes a faint pulse.
 */
export function EvalBar({ lean }: EvalBarProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(-1, Math.min(1, lean));
  // Fraction of the half-track each side fills (transform-origin at centre).
  const xFill = Math.max(0, clamped);
  const oFill = Math.max(0, -clamped);
  // Marker offset from centre: -50% (top) .. +50% (bottom) of track height.
  const markerY = (-clamped * 50).toFixed(2);

  // Pulse when the evaluation swings notably between consecutive positions.
  const prevLean = useRef(clamped);
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    if (Math.abs(clamped - prevLean.current) >= SWING_THRESHOLD) {
      setPulseKey((key) => key + 1);
    }
    prevLean.current = clamped;
  }, [clamped]);

  return (
    <div
      className="eval-bar"
      data-tour="eval"
      role="meter"
      aria-label="position evaluation"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={Number(clamped.toFixed(3))}
      data-lean={clamped >= 0 ? 'x' : 'o'}
    >
      <span className="eval-cap eval-cap--x" aria-hidden="true">
        X
      </span>
      <div className="eval-track" aria-hidden="true">
        <motion.span
          className="eval-fill eval-fill--x"
          style={{ transformOrigin: '50% 100%' }}
          initial={false}
          animate={{ scaleY: xFill }}
          transition={SPRING}
        />
        <motion.span
          className="eval-fill eval-fill--o"
          style={{ transformOrigin: '50% 0%' }}
          initial={false}
          animate={{ scaleY: oFill }}
          transition={SPRING}
        />
        <span className="eval-mid" />
        <motion.span
          className="eval-marker"
          initial={false}
          animate={{ y: `${markerY}%` }}
          transition={SPRING}
        />
        {!reduce && pulseKey > 0 && (
          <motion.span
            key={pulseKey}
            className="eval-pulse"
            data-lean={clamped >= 0 ? 'x' : 'o'}
            initial={{ opacity: 0.55, scaleY: 0.4 }}
            animate={{ opacity: 0, scaleY: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </div>
      <span className="eval-cap eval-cap--o" aria-hidden="true">
        O
      </span>
    </div>
  );
}
