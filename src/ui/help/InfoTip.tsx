import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './help.css';

interface InfoTipProps {
  /** Accessible label for the trigger button (phrased as a question). */
  label: string;
  /** One-line explanation rendered inside the popover. */
  children: React.ReactNode;
}

interface PopCoords {
  top: number;
  left: number;
}

// Half the popover's max-width, plus a small viewport margin, used to clamp the
// centered popover so it never runs off either edge.
const HALF_WIDTH = 124;
const EDGE_MARGIN = 8;

/**
 * Small ⓘ trigger with an accessible popover. The explanation reveals on hover,
 * on keyboard focus, and can be pinned open with a click; Escape closes/unpins.
 *
 * The popover is rendered through a portal to <body> and positioned `fixed` from
 * the trigger's rect — otherwise a scrollable ancestor (the present panel) would
 * clip it. The trigger stays a SIBLING of the control it documents, never nested.
 */
export function InfoTip({ label, children }: InfoTipProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coords, setCoords] = useState<PopCoords | null>(null);
  const popId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const open = hovered || focused || pinned;

  // Track the trigger's position while open so the fixed popover follows it
  // through scrolls and resizes.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const left = Math.min(
        Math.max(center, HALF_WIDTH + EDGE_MARGIN),
        window.innerWidth - HALF_WIDTH - EDGE_MARGIN,
      );
      setCoords({ top: r.top, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // A pinned popover dismisses on an outside click as well as Escape.
  useEffect(() => {
    if (!pinned) return;
    const onDocClick = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setPinned(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pinned]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setPinned(false);
      event.currentTarget.blur();
    }
  };

  return (
    <span
      className="infotip"
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        ref={btnRef}
        className="infotip-btn"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        data-tour-ignore
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => setPinned((value) => !value)}
        onKeyDown={handleKeyDown}
      >
        <span aria-hidden="true">i</span>
      </button>
      {open &&
        coords &&
        createPortal(
          <span
            role="tooltip"
            id={popId}
            className="infotip-pop"
            style={{ top: coords.top, left: coords.left }}
          >
            {children}
          </span>,
          document.body,
        )}
    </span>
  );
}
