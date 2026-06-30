import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks which deeper tree nodes are expanded, keyed by board key. Ply-1 nodes
 * are always rendered by the tree itself; this set governs everything below.
 * The set is cleared whenever the root changes (re-root / move) so each new
 * present starts with a clean, ply-1-only view.
 */
export function useExpansion(rootKey: string) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    setExpanded(new Set());
  }, [rootKey]);

  const isExpanded = useCallback((key: string) => expanded.has(key), [expanded]);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return { isExpanded, toggle };
}
