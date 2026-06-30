/**
 * First-visit spotlight tour script. Each step optionally targets a DOM element
 * by its `data-tour` attribute; when the target is absent or unmeasurable the
 * Tour falls back to a centered bubble. The welcome step is intentionally
 * target-less (centered).
 */
export interface TourStep {
  /** `data-tour` value to spotlight, or null for a centered bubble. */
  readonly target: string | null;
  readonly title: string;
  readonly body: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    target: null,
    title: 'Welcome to the Future Simulator',
    body: 'Play tic-tac-toe while the app enumerates every possible continuation in real time. Here is a 30-second tour.',
  },
  {
    target: 'board',
    title: 'The present board',
    body: 'Click any empty square to play. X and O alternate automatically, and the whole futures tree recomputes instantly.',
  },
  {
    target: 'eval',
    title: 'The evaluation bar',
    body: 'Shows which side the position favors across all futures — indigo fills toward X, rose toward O.',
  },
  {
    target: 'modes',
    title: 'Two ways to play',
    body: 'Explore freely, or switch to Beat the Oracle and try to force a draw against a flawless O.',
  },
  {
    target: 'toggles',
    title: 'Visualization toggles',
    body: 'Mark the perfect-play moves, fold symmetric branches together, tint futures by who they favor, and turn on sound.',
  },
  {
    target: 'tree',
    title: 'The futures tree',
    body: 'Every node is a possible future. Its census bar shows how its games end; expand ▸ to go deeper or click to teleport there.',
  },
  {
    target: 'stats',
    title: 'All futures, censused',
    body: 'The present panel tallies every remaining game and states the minimax truth — the result with perfect play from both sides.',
  },
];
