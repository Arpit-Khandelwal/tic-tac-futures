import { useLayoutEffect, useState, type RefObject } from 'react';
import { motion } from 'framer-motion';

interface ConnectorsProps {
  containerRef: RefObject<HTMLElement>;
  /** Selector for the child <ul> directly under the container. */
  listSelector?: string;
  /** Re-measure when these change (expansion, fold, re-root). */
  deps: readonly unknown[];
}

interface PathSpec {
  readonly key: string;
  readonly d: string;
}

/**
 * Curved node-link connectors drawn from a parent card's right edge to each
 * child card's left edge. Rendered as an absolutely-positioned SVG overlay, so
 * if measurement is unavailable (e.g. jsdom, or before first layout) it simply
 * renders nothing and the tree stays correct — connectors are pure polish.
 *
 * Coordinates are taken from getBoundingClientRect relative to the container's
 * own rect; since the children scroll together with the container, the deltas
 * are scroll-invariant. A ResizeObserver re-measures after layout settles.
 */
export function Connectors({
  containerRef,
  listSelector = ':scope > .tree-children',
  deps,
}: ConnectorsProps) {
  const [paths, setPaths] = useState<readonly PathSpec[]>([]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const parentCard = el.querySelector(':scope > .node-card');
      const list = el.querySelector(listSelector);
      if (!parentCard || !list) {
        setPaths([]);
        return;
      }
      const childCards = list.querySelectorAll(':scope > .tree-node > .node-card');
      const base = el.getBoundingClientRect();
      if (base.width === 0) {
        setPaths([]);
        return;
      }
      const pr = parentCard.getBoundingClientRect();
      const x1 = pr.right - base.left;
      const y1 = pr.top - base.top + pr.height / 2;
      const next: PathSpec[] = [];
      childCards.forEach((cc, i) => {
        const r = cc.getBoundingClientRect();
        const x2 = r.left - base.left;
        const y2 = r.top - base.top + r.height / 2;
        const mx = x1 + (x2 - x1) * 0.5;
        next.push({ key: `${i}-${Math.round(y2)}`, d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` });
      });
      setPaths(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll(listSelector + ' > .tree-node > .node-card').forEach((n) =>
      ro.observe(n),
    );
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, listSelector, ...deps]);

  if (paths.length === 0) return null;

  return (
    <svg className="connectors" aria-hidden="true" preserveAspectRatio="none">
      {paths.map((p) => (
        <motion.path
          key={p.key}
          d={p.d}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth={1.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}
