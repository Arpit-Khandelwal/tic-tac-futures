import { useCallback, useEffect, useRef, useState } from 'react';
import { TOUR_STEPS } from './steps';

const STORAGE_KEY = 'ttt-tour-seen';

function readSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true; // If storage is unavailable, never nag — treat as seen.
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Ignore — a missing flag only means the tour may auto-run again.
  }
}

export interface TourController {
  readonly open: boolean;
  readonly step: number;
  readonly total: number;
  /** Start (or replay) from the first step. */
  readonly start: () => void;
  readonly next: () => void;
  readonly back: () => void;
  /** Dismiss the tour (Skip or finishing the last step). */
  readonly close: () => void;
}

/**
 * Owns first-visit tour state. Auto-runs once when the `ttt-tour-seen` flag is
 * absent, then sets the flag so refreshes don't re-trigger it. The persistent
 * "Take the tour" button calls `start` to replay it any time.
 */
export function useTour(): TourController {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const autoChecked = useRef(false);

  useEffect(() => {
    if (autoChecked.current) return;
    autoChecked.current = true;
    if (!readSeen()) {
      setStep(0);
      setOpen(true);
      markSeen();
    }
  }, []);

  const start = useCallback(() => {
    setStep(0);
    setOpen(true);
    markSeen();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
  }, []);

  const next = useCallback(() => {
    setStep((current) => {
      if (current >= TOUR_STEPS.length - 1) {
        setOpen(false);
        markSeen();
        return current;
      }
      return current + 1;
    });
  }, []);

  const back = useCallback(() => {
    setStep((current) => Math.max(0, current - 1));
  }, []);

  return { open, step, total: TOUR_STEPS.length, start, next, back, close };
}
