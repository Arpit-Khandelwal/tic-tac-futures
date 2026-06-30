import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  census as engineCensus,
  children as engineChildren,
  foldedChildren as engineFoldedChildren,
  positionLean,
} from '../../engine';
import type { Board as BoardType, FoldedNode } from '../../engine/types';
import { useExpansion } from '../hooks/useExpansion';
import { boardKey } from '../lib/boardKey';
import { Connectors } from './Connectors';
import { NodeCard } from './NodeCard';
import { TreeNode } from './TreeNode';
import { TreeHoverProvider, useNodeLit, useTreeHover } from './TreeHover';
import './tree.css';

interface FuturesTreeProps {
  board: BoardType;
  overlay: boolean;
  fold: boolean;
  heatmap: boolean;
  /** Explore mode: nodes teleport the present. Oracle mode: nodes are inert. */
  interactive: boolean;
  onTeleport: (board: BoardType) => void;
}

/**
 * Left→right node-link tree rooted at the present board. Ply-1 children are
 * always shown (expanded by default); deeper nodes expand on click. Re-rooting
 * (the `rootKey` changing) replays the entry stagger and resets expansion.
 */
export function FuturesTree(props: FuturesTreeProps) {
  return (
    <TreeHoverProvider>
      <FuturesTreeInner {...props} />
    </TreeHoverProvider>
  );
}

function FuturesTreeInner({
  board,
  overlay,
  fold,
  heatmap,
  interactive,
  onTeleport,
}: FuturesTreeProps) {
  const rootRowRef = useRef<HTMLDivElement>(null);
  const rootKey = boardKey(board);
  const { isExpanded, toggle } = useExpansion(rootKey);
  const { setPath } = useTreeHover();
  const rootLit = useNodeLit(rootKey);
  const rootCensus = engineCensus(board);
  const ply1 = fold ? engineFoldedChildren(board) : engineChildren(board);

  return (
    // Container-level entrance, fired once on mount (NOT keyed by rootKey), so
    // it never replays on re-root and never propagates into the tree nodes,
    // which self-animate to their own visible end states.
    <motion.section
      className="futures"
      aria-labelledby="futures-heading"
      data-tour="tree"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="panel-head futures-head">
        <span className="eyebrow">The Futures</span>
        <h2 id="futures-heading" className="panel-title">
          Branching game tree
        </h2>
        <p className="futures-hint">
          {ply1.length === 0
            ? 'Terminal position — no futures remain.'
            : interactive
              ? 'Click any node to teleport the present there. Expand ▸ to go deeper.'
              : 'Live Oracle game — expand ▸ to explore what each move leads to.'}
        </p>
      </header>

      <div className="tree-scroll">
        <div className="tree-root-row" ref={rootRowRef}>
          <Connectors
            containerRef={rootRowRef}
            listSelector=":scope > .tree-children--root"
            deps={[rootKey, fold, ply1.length]}
          />
          <NodeCard
            board={board}
            census={rootCensus}
            isRoot
            teleportable={interactive}
            lit={rootLit}
            heatmap={heatmap}
            lean={heatmap ? positionLean(board) : 0}
            onTeleport={() => onTeleport(board)}
            onHoverStart={() => setPath(new Set([rootKey]))}
            onHoverEnd={() => setPath(new Set())}
          />

          {/* Keyed by rootKey so a re-root remounts the whole list: nodes get a
              fresh entry animation and no stale subtree from the previous root
              lingers (which previously shoved the new children sideways). Each
              TreeNode animates itself in — no fragile variant propagation. */}
          <ul key={rootKey} className="tree-children tree-children--root">
            {ply1.map((node, i) => (
              <TreeNode
                key={boardKey(node.board)}
                node={node}
                multiplier={'multiplier' in node ? (node as FoldedNode).multiplier : undefined}
                index={i}
                depth={1}
                overlay={overlay}
                fold={fold}
                heatmap={heatmap}
                interactive={interactive}
                ancestors={[rootKey]}
                isExpanded={isExpanded}
                toggle={toggle}
                onTeleport={onTeleport}
              />
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
