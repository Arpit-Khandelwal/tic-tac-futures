/**
 * Centralized, accurate explanatory copy for the self-explaining controls and
 * the "How it works" legend. Kept in one place so the InfoTips, the legend
 * panel, and the tour stay consistent and easy to audit.
 */

export interface ControlCopy {
  /** Accessible label for the ⓘ button (a question, for screen readers). */
  readonly label: string;
  /** One-line explanation shown in the popover. */
  readonly body: string;
}

export const CONTROL_COPY = {
  overlay: {
    label: 'What does the Minimax overlay do?',
    body: 'Marks the perfect-play move(s) with ★ — the optimal choice if both sides play flawlessly.',
  },
  fold: {
    label: 'What does Fold symmetries do?',
    body: 'Merges mirror/rotation-equivalent branches into one (the 9 openings collapse to 3: corner ×4, edge ×4, center ×1).',
  },
  heatmap: {
    label: 'What does the Fate heatmap do?',
    body: 'Tints each future by which side it favors across all continuations (indigo = X-leaning, rose = O-leaning).',
  },
  sound: {
    label: 'What does Sound do?',
    body: 'Soft audio cues for moves and game endings.',
  },
  mode: {
    label: 'What is Beat the Oracle?',
    body: 'You play X; the app answers as O. Try to force a draw against perfect play.',
  },
  difficulty: {
    label: 'What do Perfect and Random mean?',
    body: 'Perfect: O always plays optimally. Random: O plays a random legal move.',
  },
} as const satisfies Record<string, ControlCopy>;

export interface LegendEntry {
  readonly term: string;
  readonly definition: string;
}

export const LEGEND_ENTRIES: readonly LegendEntry[] = [
  { term: 'X / O / draw', definition: 'Indigo is X, rose is O, neutral gray is a drawn outcome — used everywhere.' },
  { term: '★ best move', definition: 'The minimax-optimal move(s): the best you can do if both sides play perfectly.' },
  { term: 'Census bar', definition: 'A stacked bar showing the share of all remaining games that end X-win / draw / O-win.' },
  { term: '×N', definition: 'A folded representative standing in for N symmetric (mirror/rotation) moves.' },
  { term: 'Eval bar', definition: 'How far the position leans toward X (indigo, up) or O (rose, down).' },
  { term: 'Move quality', definition: 'Your last move graded against perfect play: Best, Inaccuracy, or Blunder.' },
];
