import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';

describe('Tic-Tac-Toe Future Simulator UI', () => {
  it('places an alternating mark and recomputes when a board square is clicked', () => {
    render(<App />);

    // X is to move on an empty board, so the only tree branches are X moves.
    expect(screen.getByText('To move')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /teleport to position O →/i })).toBeNull();

    // The present board exposes each cell as a labelled button.
    const present = screen.getByRole('group', { name: /present tic-tac-toe board/i });
    const center = within(present).getByRole('button', { name: /square 4, empty/i });
    fireEvent.click(center);

    // The square now holds X and the futures tree recomputed: O now moves next,
    // so the ply-1 branches are O moves.
    expect(within(present).getByRole('button', { name: /square 4, X/i })).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /teleport to position O →/i }).length,
    ).toBeGreaterThan(0);
  });

  it('re-roots the present onto the chosen position when a tree node is clicked', () => {
    render(<App />);

    const present = screen.getByRole('group', { name: /present tic-tac-toe board/i });
    // Present board starts empty — no X marks.
    expect(within(present).queryByRole('button', { name: /square \d, X/i })).toBeNull();

    // Teleport to the ply-1 node where X plays the center square.
    const teleport = screen.getByRole('button', { name: /teleport to position X → center/i });
    fireEvent.click(teleport);

    // The present board now reflects that position: center holds X, and the tree
    // re-rooted there so its ply-1 branches are O moves.
    expect(within(present).getByRole('button', { name: /square 4, X/i })).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /teleport to position O →/i }).length,
    ).toBeGreaterThan(0);
  });

  it('folds symmetric branches into representatives with multipliers', () => {
    render(<App />);

    // Literal tree: an empty board fans out into 9 ply-1 X moves.
    expect(screen.getAllByRole('button', { name: /teleport to position X →/i })).toHaveLength(9);

    // Turn on symmetry folding.
    fireEvent.click(screen.getByRole('switch', { name: /merge mirror & rotated moves/i }));

    // 9 openings collapse to 3 classes: corner, edge, center.
    expect(screen.getAllByRole('button', { name: /teleport to position X →/i })).toHaveLength(3);
    // The corner and edge classes each represent four symmetric moves.
    expect(screen.getAllByLabelText('represents 4 symmetric moves')).toHaveLength(2);
  });
});
