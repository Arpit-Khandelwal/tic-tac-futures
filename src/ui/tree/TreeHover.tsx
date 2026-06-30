import { createContext, useContext, useMemo, useState } from 'react';

interface TreeHoverValue {
  /** Board keys on the currently hovered root→node path (empty = nothing lit). */
  readonly path: ReadonlySet<string>;
  readonly setPath: (path: ReadonlySet<string>) => void;
}

const EMPTY: ReadonlySet<string> = new Set();

const TreeHoverContext = createContext<TreeHoverValue>({
  path: EMPTY,
  setPath: () => undefined,
});

export function TreeHoverProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<ReadonlySet<string>>(EMPTY);
  const value = useMemo(() => ({ path, setPath }), [path]);
  return <TreeHoverContext.Provider value={value}>{children}</TreeHoverContext.Provider>;
}

export function useTreeHover() {
  return useContext(TreeHoverContext);
}

/**
 * Lit/dimmed state for a node given the hovered path. Returns null when nothing
 * is hovered (neutral), true when this node is on the path, false otherwise.
 */
export function useNodeLit(key: string): boolean | null {
  const { path } = useTreeHover();
  if (path.size === 0) return null;
  return path.has(key);
}
