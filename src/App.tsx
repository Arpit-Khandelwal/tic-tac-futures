import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { currentTurn } from './engine';
import type { Board } from './engine/types';
import { PresentPanel } from './ui/present/PresentPanel';
import { FuturesTree } from './ui/tree/FuturesTree';
import { useGameTree } from './ui/hooks/useGameTree';
import { useOracle, type OracleDifficulty } from './ui/game/useOracle';
import { bestStreak, lastMoveInfo, lastMoveInfoBy } from './ui/game/analysis';
import { useSound } from './ui/effects/useSound';
import { Tour } from './ui/tour/Tour';
import { useTour } from './ui/tour/useTour';
import type { Mode } from './ui/game/ModeSwitch';
import './ui/app.css';

export default function App() {
  const game = useGameTree();
  const [mode, setMode] = useState<Mode>('explore');
  const [difficulty, setDifficulty] = useState<OracleDifficulty>('perfect');
  const [overlay, setOverlay] = useState(false);
  const [fold, setFold] = useState(false);
  const [heatmap, setHeatmap] = useState(true);
  const [sound, setSound] = useState(true);
  const [teleportPing, setTeleportPing] = useState(0);
  const tour = useTour();

  const { play, playOutcome } = useSound(sound);

  // Teleporting re-roots the present board; bump a counter so the present panel
  // can play a one-shot ripple. A plain placeMark must NOT trigger it, so the
  // ripple is driven by this explicit teleport wrapper rather than board diffing.
  const handleTeleport = useCallback(
    (target: Board) => {
      game.teleport(target);
      setTeleportPing((value) => value + 1);
    },
    [game],
  );

  const thinking = useOracle({
    board: game.board,
    turn: game.turn,
    terminal: game.terminal,
    active: mode === 'oracle',
    difficulty,
    placeMark: game.placeMark,
  });

  // In Oracle mode, keep the quality badge on the human's (X) own move rather
  // than letting it flip to the Oracle's auto-reply a moment later.
  const moveInfo = useMemo(
    () => (mode === 'oracle' ? lastMoveInfoBy(game.history, 'X') : lastMoveInfo(game.history)),
    [game.history, mode],
  );
  const streak = useMemo(() => bestStreak(game.history, 'X'), [game.history]);

  // Sound cues follow the history stack: a blip on each new move, an outcome
  // chime when a move ends the game. Teleport/undo/reset don't grow-then-end.
  const prevLen = useRef(game.history.length);
  useEffect(() => {
    if (game.history.length > prevLen.current) {
      if (game.terminal && game.outcome) {
        playOutcome(game.outcome, mode === 'oracle' && game.outcome === 'O');
      } else {
        play('place');
      }
    }
    prevLen.current = game.history.length;
  }, [game.history.length, game.terminal, game.outcome, mode, play, playOutcome]);

  // Switching into Oracle mid-exploration starts a fresh game as X.
  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    if (next === 'oracle') game.reset();
    setMode(next);
  };

  // In Oracle mode a single Undo would just re-trigger the Oracle's reply (and,
  // on Random, a different one). Step back to the human's previous decision —
  // the prior X-to-move position — so Undo actually retracts the player's move.
  const handleUndo = () => {
    if (mode !== 'oracle') {
      game.undo();
      return;
    }
    const len = game.history.length;
    game.undo();
    if (len >= 3 && currentTurn(game.history[len - 2]) !== 'X') {
      game.undo();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <motion.header
          className="app-bar"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="app-mark" aria-hidden="true">
            <span className="app-mark-x">X</span>
            <span className="app-mark-o">O</span>
          </div>
          <div className="app-titles">
            <h1 className="app-title">Tic-Tac-Toe Future Simulator</h1>
            <p className="app-sub">
              Every legal continuation, enumerated and censused in real time.
            </p>
          </div>
          <button type="button" className="app-tour-btn" onClick={tour.start}>
            Take the tour
          </button>
        </motion.header>

        <main className="app-grid">
          <PresentPanel
            game={game}
            onUndo={handleUndo}
            mode={mode}
            difficulty={difficulty}
            onModeChange={handleModeChange}
            onDifficultyChange={setDifficulty}
            overlay={overlay}
            onToggleOverlay={() => setOverlay((v) => !v)}
            fold={fold}
            onToggleFold={() => setFold((v) => !v)}
            heatmap={heatmap}
            onToggleHeatmap={() => setHeatmap((v) => !v)}
            sound={sound}
            onToggleSound={() => setSound((v) => !v)}
            moveInfo={moveInfo}
            streak={streak}
            thinking={thinking}
            teleportPing={teleportPing}
          />
          <FuturesTree
            board={game.board}
            overlay={overlay}
            fold={fold}
            heatmap={heatmap}
            interactive={mode === 'explore'}
            onTeleport={handleTeleport}
          />
        </main>
      </div>
      <Tour
        open={tour.open}
        step={tour.step}
        total={tour.total}
        onNext={tour.next}
        onBack={tour.back}
        onSkip={tour.close}
      />
    </MotionConfig>
  );
}
