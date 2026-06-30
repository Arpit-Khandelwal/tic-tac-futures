# tic-tac-futures

> A pocket time machine for tic-tac-toe. Make a move, then step *forward* through
> every timeline that move creates — branching, counted, and explorable in real time.

A fun side project that treats the world's simplest game as a tiny block universe.
The present board is your "now"; the **futures tree** is the multiverse of everything
that could happen next. Click any branch to **teleport** your now into that timeline
and watch the future re-grow around you.

## A little combinatorics

From the empty board there are `9!` = **362,880** ways to *order* nine moves — but games
end the instant someone gets three in a row, and not every ordering is legal. Prune
those and you're left with exactly:

```
255,168 complete games
├── 131,184  X wins
├──  46,080  draws
└──  77,904  O wins
```

This app enumerates that space lazily, one branch at a time, and shows you the **census**
— how many of those 255,168 timelines flow through each node you're looking at. Counts
roll up the tree live as you expand it.

A nice party fact falls out of the symmetry: the 9 opening squares are really only **3**
moves in disguise (a corner, an edge, the center) because the square has 8 symmetries —
the dihedral group **D4**, rotations + reflections. Flip the **Fold symmetries** toggle
and mirror-image timelines collapse into one (corner ×4, edge ×4, center ×1).

## Bending time

- **Teleport.** Click any node in the tree and the present board jumps to that position.
  Your "now" is just a bookmark in the block universe — move it freely.
- **Two timelines to play in:**
  - **Explore** — auto-alternating play; wander the futures with no opponent.
  - **Beat the Oracle** — you're X against an opponent who has *already seen every future*
    (perfect minimax play, or random if you want a fair fight). Every move you make is
    graded **best / inaccuracy / blunder**, with a best-move streak counter. Spoiler from
    the future: against perfect play the best you can force is a draw.
- **Census vs. prophecy.** Raw outcome tallies by default; toggle the **minimax overlay**
  to light up the theoretically optimal moves and the game-theoretic verdict — what *will*
  happen if both sides play perfectly from here.
- **Fate heatmap.** Tint every move by which side destiny favors.
- **Effects** — sound, a win-line that draws itself, and a small celebration — all of which
  politely stand down under `prefers-reduced-motion`.
- **Onboarding** — a first-visit spotlight tour, inline ⓘ tooltips, and a "How it works"
  legend so the controls explain themselves.

## Tech stack

Vite · React 18 · TypeScript · framer-motion · plain CSS with design tokens.
Tests: Vitest + Testing Library + jsdom (the engine sits at 100% coverage).

## Run it locally

This project uses **[Bun](https://bun.sh)**.

```bash
bun install      # install dependencies
bun run dev      # dev server → http://localhost:5173
bun run test     # full test suite
bun run typecheck
bun run build    # type-check + production build
bun run preview  # preview the production build
```

> npm/Node work too, but `bun` is the reliable path in this environment.

## How it's built

A pure, framework-free **engine** computes everything about the game; a **UI** layer just
draws it. They're separated by a frozen type contract so each side can evolve alone.

```
src/
├── engine/                 # pure game logic, all memoized by a 9-char boardKey
│   ├── types.ts            # FROZEN contract: Board, Census, Minimax, FutureNode, …
│   ├── rules.ts            # board basics, LINES, winner, boardKey
│   ├── census.ts           # full outcome counts for any position
│   ├── minimax.ts          # game-theoretic verdict + optimal moves
│   ├── children.ts         # children() and foldedChildren() (symmetry-grouped)
│   ├── symmetry.ts         # the D4 group, canonicalize, canonical keys
│   ├── quality.ts          # classifyMove (best/inaccuracy/blunder), positionLean
│   └── index.ts            # re-exports + compile-time Engine contract guard
├── ui/
│   ├── present/            # the live board, controls, verdict, legend
│   ├── tree/               # FuturesTree + self-animating TreeNode / NodeCard
│   ├── game/               # mode switch, the Oracle opponent, move analysis, streak
│   ├── eval/               # eval bar + move-quality badge
│   ├── effects/            # sound, win-line, celebration
│   ├── tour/               # first-run spotlight tour
│   ├── help/               # info tooltips + legend copy
│   └── shared/             # mini-board, census bar, rolling numbers
├── styles/global.css       # design tokens (semantic palette, spacing, motion)
└── App.tsx                 # shell / state orchestration
```

Because every position is keyed by its 9-character `boardKey`, census and minimax results
are memoized and shared across the whole tree — the multiverse is cheap to recount.

### Two invariants worth keeping

- **Nodes self-animate** to a visible end state with explicit `initial`/`animate`; visibility
  is never delegated to parent→child variant propagation through `AnimatePresence`.
- The root child list is a plain `<ul key={rootKey}>` that **remounts cleanly on re-root**.

Both exist because violating them made tree nodes vanish — twice. Don't reintroduce the bug.

## Verified anchors

- `census(empty)` = 255,168 total · 131,184 X / 46,080 draw / 77,904 O
- `minimax(empty)` = DRAW (perfect play is always a tie — the oldest spoiler in gaming)
- A corner opening folds O's 8 replies down to 5 distinct classes under D4.
