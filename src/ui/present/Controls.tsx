import { InfoTip } from '../help/InfoTip';
import { CONTROL_COPY, type ControlCopy } from '../help/copy';

interface ToggleProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  info: ControlCopy;
}

/**
 * A switch paired with its explanatory InfoTip as a SIBLING — never nested, so
 * the ⓘ has its own focus order and click target and the markup stays valid.
 */
function Toggle({ label, checked, onToggle, info }: ToggleProps) {
  return (
    <div className="toggle-row">
      <button
        type="button"
        className="toggle"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
      >
        <span className="toggle-track" data-on={checked}>
          <span className="toggle-thumb" />
        </span>
        <span className="toggle-label">{label}</span>
      </button>
      <InfoTip label={info.label}>{info.body}</InfoTip>
    </div>
  );
}

interface ControlsProps {
  canUndo: boolean;
  overlay: boolean;
  onUndo: () => void;
  onReset: () => void;
  onToggleOverlay: () => void;
  fold: boolean;
  onToggleFold: () => void;
  heatmap: boolean;
  onToggleHeatmap: () => void;
  sound: boolean;
  onToggleSound: () => void;
}

export function Controls({
  canUndo,
  overlay,
  onUndo,
  onReset,
  onToggleOverlay,
  fold,
  onToggleFold,
  heatmap,
  onToggleHeatmap,
  sound,
  onToggleSound,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-row">
        <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className="btn" onClick={onReset} disabled={!canUndo}>
          Reset
        </button>
      </div>
      <div className="controls-toggles" data-tour="toggles">
        <Toggle
          label="Mark the best moves (★)"
          checked={overlay}
          onToggle={onToggleOverlay}
          info={CONTROL_COPY.overlay}
        />
        <Toggle
          label="Merge mirror & rotated moves"
          checked={fold}
          onToggle={onToggleFold}
          info={CONTROL_COPY.fold}
        />
        <Toggle
          label="Tint moves by who's favored"
          checked={heatmap}
          onToggle={onToggleHeatmap}
          info={CONTROL_COPY.heatmap}
        />
        <Toggle
          label="Sound effects"
          checked={sound}
          onToggle={onToggleSound}
          info={CONTROL_COPY.sound}
        />
      </div>
    </div>
  );
}
