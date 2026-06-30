import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { census, minimax, positionLean } from '../../engine';
import { Board } from '../board/Board';
import { CensusBar } from '../shared/CensusBar';
import { EvalBar } from '../eval/EvalBar';
import { MoveQualityBadge } from '../eval/MoveQualityBadge';
import { ModeSwitch, type Mode } from '../game/ModeSwitch';
import { StreakCounter } from '../game/StreakCounter';
import type { MoveInfo } from '../game/analysis';
import type { OracleDifficulty } from '../game/useOracle';
import { LegendPanel } from '../help/LegendPanel';
import { winningLine } from '../lib/lines';
import { Controls } from './Controls';
import { TurnIndicator } from './TurnIndicator';
import { Verdict } from './Verdict';
import type { GameTree } from '../hooks/useGameTree';
import '../effects/effects.css';
import './present.css';

interface PresentPanelProps {
  game: GameTree;
  /** Mode-aware undo (Oracle steps back to the human's prior turn). */
  onUndo: () => void;
  mode: Mode;
  difficulty: OracleDifficulty;
  onModeChange: (mode: Mode) => void;
  onDifficultyChange: (difficulty: OracleDifficulty) => void;
  overlay: boolean;
  onToggleOverlay: () => void;
  fold: boolean;
  onToggleFold: () => void;
  heatmap: boolean;
  onToggleHeatmap: () => void;
  sound: boolean;
  onToggleSound: () => void;
  moveInfo: MoveInfo | null;
  streak: number;
  thinking: boolean;
  /** Increments on each teleport (tree re-root) to trigger the board ripple. */
  teleportPing: number;
}

export function PresentPanel({
  game,
  onUndo,
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  overlay,
  onToggleOverlay,
  fold,
  onToggleFold,
  heatmap,
  onToggleHeatmap,
  sound,
  onToggleSound,
  moveInfo,
  streak,
  thinking,
  teleportPing,
}: PresentPanelProps) {
  const { board, turn, outcome, terminal } = game;
  const reduceMotion = useReducedMotion();
  const positionCensus = census(board);
  const analysis = minimax(board);
  const lean = positionLean(board);
  const optimalMoves = overlay && !terminal ? analysis.optimalMoves : [];

  const line = terminal ? winningLine(board) : null;
  const humanLost = mode === 'oracle' && outcome === 'O';
  const celebrationKind = !terminal
    ? null
    : outcome === 'draw'
      ? 'draw'
      : humanLost
        ? 'loss'
        : 'win';
  // Confetti/shake are suppressed under reduced motion; the win line stays.
  const celebration = reduceMotion ? null : celebrationKind;
  const shake = celebration === 'loss';

  return (
    <motion.section
      className="present"
      aria-labelledby="present-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="panel-head">
        <span className="eyebrow">The Present</span>
        <h2 id="present-heading" className="panel-title">
          Live position
        </h2>
      </header>

      <ModeSwitch
        mode={mode}
        difficulty={difficulty}
        onModeChange={onModeChange}
        onDifficultyChange={onDifficultyChange}
      />

      <TurnIndicator turn={turn} outcome={outcome} />

      <AnimatePresence>
        {thinking && (
          <motion.p
            className="thinking"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="thinking-dot" aria-hidden="true" />
            The Oracle is thinking…
          </motion.p>
        )}
      </AnimatePresence>

      <div className="board-stage" data-shake={shake}>
        <EvalBar lean={lean} />
        <div className="board-frame" data-tour="board">
          <Board
            board={board}
            nextPlayer={turn}
            terminal={terminal}
            optimalMoves={optimalMoves}
            winningLine={line}
            winner={outcome}
            celebration={celebration}
            onPlace={game.placeMark}
          />
          {!reduceMotion && teleportPing > 0 && (
            <motion.span
              key={teleportPing}
              className="teleport-ripple"
              initial={{ opacity: 0.5, scale: 0.2 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <MoveQualityBadge move={moveInfo} />

      {mode === 'oracle' && <StreakCounter streak={streak} />}

      <Controls
        canUndo={game.canUndo}
        overlay={overlay}
        onUndo={onUndo}
        onReset={game.reset}
        onToggleOverlay={onToggleOverlay}
        fold={fold}
        onToggleFold={onToggleFold}
        heatmap={heatmap}
        onToggleHeatmap={onToggleHeatmap}
        sound={sound}
        onToggleSound={onToggleSound}
      />

      <div className="present-stats" data-tour="stats">
        <div className="stat-block">
          <span className="eyebrow">All futures from here</span>
          <CensusBar census={positionCensus} detailed />
        </div>
        <Verdict verdict={analysis.verdict} turn={turn} terminal={terminal} />
        <LegendPanel />
      </div>
    </motion.section>
  );
}
