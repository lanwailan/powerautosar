import type { TreeNodeDto } from '../../types';
import { TreeNode } from './TreeNode';

interface ARTreeViewProps {
  nodes: TreeNodeDto[];
  selectedNodeId: string | undefined;
  onNodeSelect: (nodeId: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

export function ARTreeView({ nodes, selectedNodeId, onNodeSelect, expandedIds, onToggleExpand }: ARTreeViewProps) {
  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center text-on-surface-variant text-xs">
        No nodes in this file
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto technical-scroll p-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  );
}
