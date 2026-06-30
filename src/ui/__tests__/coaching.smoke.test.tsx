import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';

function present() {
  return screen.getByRole('group', { name: /present tic-tac-toe board/i });
}

describe('Engine-style coaching & Beat the Oracle', () => {
  it('renders Oracle controls when the mode is switched', () => {
    render(<App />);

    // Default mode is Explore — no difficulty control / tagline yet.
    expect(screen.queryByRole('radiogroup', { name: /oracle difficulty/i })).toBeNull();

    fireEvent.click(screen.getByRole('radio', { name: /beat the oracle/i }));

    expect(screen.getByRole('radiogroup', { name: /oracle difficulty/i })).toBeInTheDocument();
    expect(screen.getByText(/force a draw against perfect play/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /perfect/i })).toBeInTheDocument();
  });

  it('shows a move-quality badge after a move', () => {
    render(<App />);

    fireEvent.click(within(present()).getByRole('button', { name: /square 4, empty/i }));

    // Centre opening keeps the draw — graded "Best".
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('reflects the position lean on the eval meter', () => {
    render(<App />);

    const meter = screen.getByRole('meter', { name: /position evaluation/i });
    // Empty board leans slightly toward X (more X-win futures than O-win).
    const initial = Number(meter.getAttribute('aria-valuenow'));
    expect(initial).toBeGreaterThan(0);
    expect(initial).toBeLessThanOrEqual(1);

    // Playing a move changes the evaluated position.
    fireEvent.click(within(present()).getByRole('button', { name: /square 0, empty/i }));
    const after = Number(
      screen.getByRole('meter', { name: /position evaluation/i }).getAttribute('aria-valuenow'),
    );
    expect(after).not.toBe(initial);
  });

  it('increments the best-move streak in Oracle mode', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('radio', { name: /beat the oracle/i }));

    expect(screen.getByText('Streak: 0')).toBeInTheDocument();

    // A best human (X) move bumps the streak immediately (derived from history).
    fireEvent.click(within(present()).getByRole('button', { name: /square 4, empty/i }));
    expect(screen.getByText('Streak: 1')).toBeInTheDocument();
  });

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('auto-responds as O after the human X move', () => {
      render(<App />);
      fireEvent.click(screen.getByRole('radio', { name: /beat the oracle/i }));

      // Human plays X in the centre — no O on the board yet.
      fireEvent.click(within(present()).getByRole('button', { name: /square 4, empty/i }));
      expect(within(present()).queryByRole('button', { name: /square \d, O/i })).toBeNull();

      // After the ~450ms thinking beat, the Oracle has played an O.
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(
        within(present()).getAllByRole('button', { name: /square \d, O/i }).length,
      ).toBeGreaterThan(0);
    });
  });
});
