import { motion } from 'framer-motion';
import { InfoTip } from '../help/InfoTip';
import { CONTROL_COPY } from '../help/copy';
import type { OracleDifficulty } from './useOracle';
import './mode.css';

export type Mode = 'explore' | 'oracle';

interface ModeSwitchProps {
  mode: Mode;
  difficulty: OracleDifficulty;
  onModeChange: (mode: Mode) => void;
  onDifficultyChange: (difficulty: OracleDifficulty) => void;
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'oracle', label: 'Beat the Oracle' },
];

const DIFFICULTIES: { id: OracleDifficulty; label: string }[] = [
  { id: 'perfect', label: 'Perfect' },
  { id: 'random', label: 'Random' },
];

/** Segmented mode control plus, in Oracle mode, the O-difficulty toggle. */
export function ModeSwitch({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
}: ModeSwitchProps) {
  return (
    <div className="mode-switch" data-tour="modes">
      <div className="segmented-with-info">
        <div className="segmented" role="radiogroup" aria-label="Game mode">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              className="segmented-btn"
              data-active={active}
              onClick={() => onModeChange(m.id)}
            >
              {active && (
                <motion.span
                  layoutId="segmented-indicator"
                  className="segmented-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="segmented-label">{m.label}</span>
            </button>
          );
        })}
        </div>
        <InfoTip label={CONTROL_COPY.mode.label}>{CONTROL_COPY.mode.body}</InfoTip>
      </div>

      {mode === 'oracle' && (
        <motion.div
          className="oracle-meta"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="oracle-tagline">
            You are X. Can you force a draw against perfect play?
          </p>
          <div className="segmented-with-info">
          <div className="segmented segmented--mini" role="radiogroup" aria-label="Oracle difficulty">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className="segmented-btn"
                  data-active={active}
                  onClick={() => onDifficultyChange(d.id)}
                >
                  {active && (
                    <motion.span
                      layoutId="difficulty-indicator"
                      className="segmented-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="segmented-label">{d.label}</span>
                </button>
              );
            })}
          </div>
          <InfoTip label={CONTROL_COPY.difficulty.label}>{CONTROL_COPY.difficulty.body}</InfoTip>
          </div>
        </motion.div>
      )}
    </div>
  );
}
