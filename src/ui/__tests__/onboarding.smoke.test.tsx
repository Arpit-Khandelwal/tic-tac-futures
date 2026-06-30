import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../App';
import { InfoTip } from '../help/InfoTip';
import { LegendPanel } from '../help/LegendPanel';

const TOUR_KEY = 'ttt-tour-seen';

afterEach(() => {
  localStorage.clear();
});

describe('First-visit tour', () => {
  it('auto-runs the tour on a first visit (no seen flag)', () => {
    localStorage.removeItem(TOUR_KEY);
    render(<App />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Future Simulator')).toBeInTheDocument();
  });

  it('does not auto-run once the tour has been seen', () => {
    localStorage.setItem(TOUR_KEY, '1');
    render(<App />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('advances with Next and dismisses with Skip', () => {
    localStorage.removeItem(TOUR_KEY);
    render(<App />);

    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
    expect(screen.getByText('The present board')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('replays the tour from the persistent "Take the tour" button', () => {
    localStorage.setItem(TOUR_KEY, '1');
    render(<App />);

    // Returning visitor: no dialog until they ask for it.
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /take the tour/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
  });
});

describe('Self-explaining controls', () => {
  it('reveals an InfoTip explanation on focus', () => {
    render(<InfoTip label="What does this do?">It explains the control.</InfoTip>);

    expect(screen.queryByText('It explains the control.')).toBeNull();

    fireEvent.focus(screen.getByRole('button', { name: /what does this do\?/i }));
    expect(screen.getByText('It explains the control.')).toBeInTheDocument();
  });

  it('toggles the "How it works" legend open and closed', () => {
    render(<LegendPanel />);

    const toggle = screen.getByRole('button', { name: /how it works/i });
    expect(screen.queryByRole('region', { name: /how it works/i })).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole('region', { name: /how it works/i })).toBeInTheDocument();
    expect(screen.getByText('★ best move')).toBeInTheDocument();
  });
});
