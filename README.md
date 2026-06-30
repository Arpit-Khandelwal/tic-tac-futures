# tic-tac-futures

A tic-tac-toe **future simulator**. Play a move on the present board and instantly
see *every* game that could follow it, laid out as a living tree and tallied in real
time. Tic-tac-toe has exactly **255,168** complete games from the empty board
(131,184 X-wins · 46,080 draws · 77,904 O-wins) — this app lets you walk that space
one branch at a time.

Clean white Swiss-editorial visual direction, responsive micro-animations, and a
guided first-run tour.

## What it does

- **Futures tree (the hero).** Every legal continuation of the present position is a
  node. Each node carries the *census* of all complete games reachable through it.
  Drill in progressively to expand grandchildren; the counts roll up live.
- **Teleport.** Click any node in the tree to re-root the present board to that
  position — the tree re-grows from your new "now."
- **Two modes:**
  - **Explore** — auto-alternating play; inspect futures freely.
  - **Beat the Oracle** — you play X against a perfect (or random) opponent. Every
    one of your moves is graded *best / inaccuracy / blunder*, with a best-move streak
    counter. The Oracle plays tic-tac-toe optimally, so a perfect game can only ever
    be forced to a draw.
- **Census vs. minimax.** Raw outcome tallies by default; toggle a **minimax overlay**
  to mark theoretically optimal moves and the game-theoretic verdict.
- **Symmetry folding.** Toggle D4 (rotation + reflection) folding to merge equivalent
  branches — the 9 opening squares collapse to 3 classes (corner ×4, edge ×4, center ×1).
- **Fate heatmap.** Tint each move by which side it favors.
- **Sound, win-line draw-on, and celebration effects** — all respecting reduced-motion.
- **Onboarding** — a spotlight tour on first visit plus inline ⓘ tooltips and a
  "How it works" legend.

## Tech stack

Vite · React 18 · TypeScript · framer-motion · plain CSS with design tokens.
Tests: Vitest + Testing Library + jsdom (engine at 100% coverage).

## Getting started

This project uses **[Bun](https://bun.sh)** as the runner.

```bash
bun install      # install dependencies
bun run dev      # start the dev server (http://localhost:5173)
bun run test     # run the full test suite
bun run typecheck
bun run build    # type-check + production build
bun run preview  # preview the production build
```

> npm/Node also work, but the local environment's `node`/`npm` are nvm shims — `bun`
> is the reliable path here.

## Architecture

The codebase is split into a pure **engine** and a **UI** layer, separated by a frozen
type contract so each side can evolve independently.

```
src/
├── engine/                 # pure, framework-free game logic (memoized)
│   ├── types.ts            # FROZEN contract: Board, Census, Minimax, FutureNode, …
│   ├── rules.ts            # board basics, LINES, winner, boardKey
│   ├── census.ts           # full outcome counts for any position (memoized)
│   ├── minimax.ts          # game-theoretic verdict + optimal moves (memoized)
│   ├── children.ts         # children() and foldedChildren() (symmetry-grouped)
│   ├── symmetry.ts         # D4 group, canonicalize, canonical keys
│   ├── quality.ts          # classifyMove (best/inaccuracy/blunder), positionLean
│   └── index.ts            # re-exports + compile-time Engine contract guard
├── ui/
│   ├── present/            # the live board, controls, verdict, legend
│   ├── tree/               # FuturesTree + self-animating TreeNode/NodeCard
│   ├── game/               # mode switch, Oracle opponent, move analysis, streak
│   ├── eval/               # eval bar + move-quality badge
│   ├── effects/            # sound, win-line, celebration
│   ├── tour/               # first-run spotlight tour
│   ├── help/               # info tooltips + legend copy
│   └── shared/             # mini-board, census bar, rolling numbers
├── styles/global.css       # design tokens (semantic palette, spacing, motion)
└── App.tsx                 # shell / state orchestration
```

Everything is keyed by a 9-character `boardKey`, which makes census and minimax results
trivially memoizable across the tree.

### Animation invariant

Tree nodes **self-animate** to a visible end state with explicit `initial`/`animate`
values; visibility is never delegated to parent→child variant propagation through
`AnimatePresence`. The root child list is a plain `<ul key={rootKey}>` that remounts
cleanly on re-root. (Both rules exist because violating them regressed node visibility
twice — keep them.)

## Verified anchors

- `census(empty)` = 255,168 total · 131,184 X / 46,080 draw / 77,904 O
- `minimax(empty)` = DRAW
- Corner opening folds O's 8 replies to 5 distinct classes under D4.
