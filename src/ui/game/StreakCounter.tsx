import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface StreakCounterProps {
  streak: number;
}

const MILESTONE = 3;

/**
 * Consecutive best-move streak for the human (X) in Oracle mode. The numeric
 * value is rendered as plain text ("Streak: N") so it is trivially assertable,
 * and milestones (every 3) get a subtle celebratory flag.
 */
export function StreakCounter({ streak }: StreakCounterProps) {
  const reduce = useReducedMotion();
  const milestone = streak > 0 && streak % MILESTONE === 0;
  return (
    <div className="streak" data-active={streak > 0} data-milestone={milestone}>
      <span className="eyebrow">Best-move streak</span>
      <div className="streak-row">
        <span className="streak-value-wrap">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={streak}
              className="streak-value tnum"
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 460, damping: 24 }}
            >
              {streak}
            </motion.span>
          </AnimatePresence>
          {milestone && !reduce && (
            <motion.span
              key={`burst-${streak}`}
              className="streak-burst"
              initial={{ opacity: 0.6, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
          )}
        </span>
        <span className="streak-caption">Streak: {streak}</span>
        {milestone && (
          <motion.span
            className="streak-flag"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            aria-label={`${streak} best moves in a row`}
          >
            🔥
          </motion.span>
        )}
      </div>
    </div>
  );
}
