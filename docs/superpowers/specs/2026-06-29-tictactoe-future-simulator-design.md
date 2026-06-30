# Tic-Tac-Toe Future Simulator — Design Spec

**Date:** 2026-06-29
**Status:** Approved for v1 implementation

## Concept

A clean, white, crisp interactive app. There is a **present** board (live tic-tac-toe)
and a **futures tree**. From the current position, the app instantly enumerates the
branching tree of all possible games and visualizes it. Every node is annotated with a
**census** (how many complete games in its subtree end X-win / draw / O-win) and a
**minimax** verdict (the perfect-play truth). Clicking a tree node teleports the present
board to that state and re-roots the tree.

Tic-tac-toe's full state space is tiny, so everything is computed client-side, instantly.

## Decisions (locked)

1. **Annotation = both.** Raw census tallies by default (the "all futures" census),
   with a toggleable **minimax overlay** marking optimal move(s).
2. **Progressive drill-down tree.** Show ply 1 expanded; deeper nodes expand on click.
   Each node's census reflects its **full hidden subtree**, even when collapsed.
3. **Interaction:** auto-alternating play on the board (X first), **plus** clicking any
   tree node teleports the present there and re-roots the tree.
4. **Symmetry dedupe — shipped as a toggle (post-v1).** Default is literal (every legal
   move its own branch). A "Fold symmetries" toggle collapses the 8-fold D4-equivalent
   branches into one representative carrying a `×N` multiplier (empty board: corner ×4,
   edge ×4, center ×1). Engine adds `canonicalize`/`canonicalKey` (`symmetry.ts`) and
   `foldedChildren`; representatives are the group's smallest-index move, and members
   share an identical census/minimax.
5. **Visual direction:** editorial / Swiss data-viz. White, crisp, lots of whitespace,
   precise labels, restrained palette with semantic accents. Responsive, with thoughtful
   compositor-friendly micro-animations (transform/opacity only).

## Semantic palette

- **X** = indigo
- **O** = rose
- **draw** = neutral gray
Used consistently in board marks, node glyphs, and census bars.

## Architecture

Two cleanly separated layers, owned by two agents:

### Engine (`src/engine/`) — pure TypeScript, zero UI, fully unit-tested
Public contract is **frozen** in `src/engine/types.ts`. Implementation in `src/engine/`
(split into small focused modules, re-exported from `src/engine/index.ts`).

Key functions (see `types.ts` for exact signatures):
- `emptyBoard()`, `currentTurn(board)`, `legalMoves(board)`, `applyMove(board, sq, player)` (immutable)
- `winner(board)`, `isTerminal(board)`
- `census(board) → { xWins, draws, oWins, total }` — memoized full-subtree enumeration
- `minimax(board) → { verdict, optimalMoves }` — memoized, perspective = player to move
- `children(board) → FutureNode[]` — annotated legal next positions (the tree's expand op)

**Known correctness anchors (must be tested):**
- `census(emptyBoard())` = `{ xWins: 131184, draws: 46080, oWins: 77904, total: 255168 }`
- `minimax(emptyBoard()).verdict` = `DRAW`
- A completed three-in-a-row line ⇒ the player *to move* has `LOSS`.

Requirements: immutability everywhere (never mutate a `Board`); memoize by canonical
board key so repeated node expansions are instant; validate inputs (throw on illegal
moves); small files (<300 lines each); 80%+ coverage via vitest.

### UI (`src/ui/`, `src/App.tsx`, styles) — React + framer-motion
Consumes the engine contract only. Owns all layout, styling, and animation.

Layout:
```
┌──────────────┬─────────────────────────────────────┐
│ THE PRESENT  │   THE FUTURES (pannable tree)        │
│  3x3 board   │   left→right node-link tree          │
│  turn / reset│   node = mini-board glyph + census    │
│  /undo /      │   bar; ▸ expand to go deeper;        │
│  minimax tog │   ★ marks minimax-optimal moves       │
│  census bar  │                                       │
└──────────────┴─────────────────────────────────────┘
```

Interactions & motion:
- Click empty board square → alternating mark placed; tree recomputes; new children
  **stagger in**.
- Click tree node → **teleport** present to that board; tree **re-roots** (smooth).
- Expand node → children animate open (height + fade + stagger).
- Hover/active/focus states designed; ★ subtle pulse; census bars tween.
- Reduced-motion respected. All motion on transform/opacity.

## Tech stack

Vite + React + TypeScript, framer-motion for animation, plain CSS with design tokens
(custom properties) for the Swiss aesthetic. vitest + Testing Library for tests.

## Testing

- Engine: full unit suite first (TDD), anchored by the known censuses and minimax facts.
- UI: smoke tests for board-click → recompute and node-click → re-root.

## Out of scope

Persistence, multiplayer, alternate board sizes, AI opponent modes.
(Symmetry folding was originally deferred but is now implemented — see decision 4.)
