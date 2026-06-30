import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  children as engineChildren,
  foldedChildren as engineFoldedChildren,
  isTerminal,
  positionLean,
} from '../../engine';
import type { FutureNode, FoldedNode } from '../../engine/types';
import { boardKey } from '../lib/boardKey';
import { Connectors } from './Connectors';
import { NodeCard } from './NodeCard';
import { useNodeLit, useTreeHover } from './TreeHover';

interface TreeNodeProps {
  node: FutureNode;
  multiplier?: number;
  index: number;
  depth: number;
  overlay: boolean;
  fold: boolean;
  heatmap: boolean;
  interactive: boolean;
  /** Board keys from the root down to (and excluding) this node. */
  ancestors: readonly string[];
  isExpanded: (key: string) => boolean;
  toggle: (key: string) => void;
  onTeleport: (board: FutureNode['board']) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Recursive futures-tree node. Children expand lazily on demand.
 *
 * Each node animates ITSELF in (explicit initial/animate) rather than relying on
 * variant propagation from a parent list — so the end state is always visible
 * even if the animation is interrupted by a re-render or re-root. `layout`
 * smoothly repositions siblings when a node expands. The nested child list lives
 * in an AnimatePresence so collapse fades/translates out instead of snapping;
 * the ROOT list (in FuturesTree) stays a plain keyed <ul> per the re-root fix.
 */
export function TreeNode({
  node,
  multiplier,
  index,
  depth,
  overlay,
  fold,
  heatmap,
  interactive,
  ancestors,
  isExpanded,
  toggle,
  onTeleport,
}: TreeNodeProps) {
  const liRef = useRef<HTMLLIElement>(null);
  const key = boardKey(node.board);
  const path = [...ancestors, key];
  const expanded = isExpanded(key);
  const lit = useNodeLit(key);
  const { setPath } = useTreeHover();
  const grandchildren = expanded
    ? fold
      ? engineFoldedChildren(node.board)
      : engineChildren(node.board)
    : [];

  return (
    <motion.li
      ref={liRef}
      layout="position"
      className="tree-node"
      initial={{ opacity: 0, x: -12, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: EASE, delay: Math.min(index, 12) * 0.03 }}
    >
      <Connectors containerRef={liRef} deps={[expanded, fold, grandchildren.length]} />
      <NodeCard
        board={node.board}
        census={node.census}
        move={node.move}
        player={node.player}
        multiplier={multiplier}
        optimal={node.isOptimal}
        showStar={overlay}
        hasChildren={!isTerminal(node.board)}
        expanded={expanded}
        teleportable={interactive}
        lit={lit}
        heatmap={heatmap}
        lean={heatmap ? positionLean(node.board) : 0}
        onTeleport={() => onTeleport(node.board)}
        onToggle={() => toggle(key)}
        onHoverStart={() => setPath(new Set(path))}
        onHoverEnd={() => setPath(new Set())}
      />
      <AnimatePresence initial={false}>
        {expanded && grandchildren.length > 0 && (
          <motion.ul
            className="tree-children"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {grandchildren.map((child, i) => (
              <TreeNode
                key={boardKey(child.board)}
                node={child}
                multiplier={'multiplier' in child ? (child as FoldedNode).multiplier : undefined}
                index={i}
                depth={depth + 1}
                overlay={overlay}
                fold={fold}
                heatmap={heatmap}
                interactive={interactive}
                ancestors={path}
                isExpanded={isExpanded}
                toggle={toggle}
                onTeleport={onTeleport}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
