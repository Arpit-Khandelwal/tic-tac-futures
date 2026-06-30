import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LEGEND_ENTRIES } from './copy';
import './help.css';

/**
 * Collapsible "How it works" reference for the app's visual language. Collapsed
 * by default; the disclosure animates open with the same height+fade idiom the
 * tree expansions use. The term/definition list is always in the DOM-readable
 * order so screen readers get a coherent glossary when expanded.
 */
export function LegendPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="legend">
      <button
        type="button"
        className="legend-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="legend-chevron" data-open={open} aria-hidden="true">
          ▸
        </span>
        How it works
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="legend-body"
            role="region"
            aria-label="How it works"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <dl className="legend-list">
              {LEGEND_ENTRIES.map((entry) => (
                <div key={entry.term} className="legend-item">
                  <dt className="legend-term">{entry.term}</dt>
                  <dd className="legend-def">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
