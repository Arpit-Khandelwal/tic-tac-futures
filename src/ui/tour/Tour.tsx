import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { TOUR_STEPS } from './steps';
import { useSpotlightRect } from './useSpotlightRect';
import './tour.css';

interface TourProps {
  open: boolean;
  step: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const HOLE_PAD = 10;
const BUBBLE_GAP = 16;
const MARGIN = 16;
const BUBBLE_WIDTH = 340;
const ASSUMED_BUBBLE_HEIGHT = 200;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * First-visit spotlight tour overlay. Dims the page with an SVG-masked cutout
 * over the current target and floats a labelled dialog beside it. Falls back to
 * a centered bubble when the target is missing or unmeasurable. Keyboard: Esc
 * skips, Enter/→ advance, ← goes back. Focus enters the dialog and is restored
 * on close. Honors reduced motion via the app-level MotionConfig.
 */
export function Tour({ open, step, total, onNext, onBack, onSkip }: TourProps) {
  const reduce = useReducedMotion();
  const current = TOUR_STEPS[step];
  const rect = useSpotlightRect(current?.target ?? null, open, step);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  // Capture the element that had focus when the tour opened; restore on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null;
    } else if (restoreRef.current) {
      restoreRef.current.focus?.();
      restoreRef.current = null;
    }
  }, [open]);

  // Move focus into the dialog on open and on each step change.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open, step]);

  // Global keyboard controls while the tour is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onSkip();
      } else if (event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onNext, onBack, onSkip]);

  if (!open || !current) return null;

  const isFirst = step === 0;
  const isLast = step === total - 1;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  // Cutout rect (expanded by padding); null → no hole (full dim, centered bubble).
  const hole = rect
    ? {
        x: clamp(rect.x - HOLE_PAD, 0, vw),
        y: clamp(rect.y - HOLE_PAD, 0, vh),
        width: rect.width + HOLE_PAD * 2,
        height: rect.height + HOLE_PAD * 2,
      }
    : null;

  // Bubble placement: below the target if it fits, otherwise above; centered
  // when there is no measurable target.
  let bubbleStyle: React.CSSProperties;
  let centered = false;
  if (rect) {
    const placeAbove = rect.y + rect.height + BUBBLE_GAP + ASSUMED_BUBBLE_HEIGHT > vh;
    const top = placeAbove
      ? rect.y - BUBBLE_GAP - ASSUMED_BUBBLE_HEIGHT
      : rect.y + rect.height + BUBBLE_GAP;
    const left = clamp(
      rect.x + rect.width / 2 - BUBBLE_WIDTH / 2,
      MARGIN,
      Math.max(MARGIN, vw - BUBBLE_WIDTH - MARGIN),
    );
    bubbleStyle = {
      top: clamp(top, MARGIN, Math.max(MARGIN, vh - MARGIN - 80)),
      left,
      width: Math.min(BUBBLE_WIDTH, vw - MARGIN * 2),
    };
  } else {
    centered = true;
    bubbleStyle = { width: Math.min(BUBBLE_WIDTH, vw - MARGIN * 2) };
  }

  const maskTransition = reduce ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

  return createPortal(
    <div className="tour" role="presentation">
      <svg className="tour-mask" width="100%" height="100%" aria-hidden="true">
        <defs>
          <mask id="tour-hole-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hole && (
              <motion.rect
                rx="12"
                fill="black"
                initial={false}
                animate={{ x: hole.x, y: hole.y, width: hole.width, height: hole.height }}
                transition={maskTransition}
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          className="tour-dim"
          mask="url(#tour-hole-mask)"
          onClick={onSkip}
        />
      </svg>

      <motion.div
        ref={dialogRef}
        className={`tour-bubble${centered ? ' tour-bubble--centered' : ''}`}
        style={bubbleStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="tour-step-count">
          Step {step + 1} of {total}
        </p>
        <h2 id={titleId} className="tour-title">
          {current.title}
        </h2>
        <p id={bodyId} className="tour-body">
          {current.body}
        </p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={onSkip}>
            Skip
          </button>
          <div className="tour-nav">
            <button type="button" className="tour-btn" onClick={onBack} disabled={isFirst}>
              Back
            </button>
            <button type="button" className="tour-btn tour-btn--primary" onClick={onNext}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
