import { useCallback } from 'react';
import type { TreeNodeDto } from '../../types';

interface TreeNodeProps {
  node: TreeNodeDto;
  depth: number;
  selectedNodeId: string | undefined;
  onNodeSelect: (nodeId: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

export function TreeNode({
  node,
  depth,
  selectedNodeId,
  onNodeSelect,
  expandedIds,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = node.id === selectedNodeId;

  const handleClick = useCallback(() => {
    onNodeSelect(node.id);
  }, [node.id, onNodeSelect]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggleExpand(node.id);
      }
    },
    [hasChildren, node.id, onToggleExpand]
  );

  return (
    <div className="tree-node">
      <div
        className={`flex items-center gap-2 py-0.5 px-2 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/10 border-l-2 border-primary'
            : 'hover:bg-surface-bright/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <span
            className="material-symbols-outlined text-[16px] text-outline cursor-pointer hover:text-on-surface transition-colors"
            onClick={handleToggle}
          >
            {isExpanded ? 'expand_more' : 'chevron_right'}
          </span>
        ) : (
          <span className="w-4" />
        )}

        {/* Node Type Icon */}
        <span
          className={`material-symbols-outlined text-[16px] ${
            hasChildren
              ? 'text-primary'
              : 'text-outline-variant'
          }`}
        >
          {hasChildren ? 'folder_open' : 'description'}
        </span>

        {/* Node Label */}
        <span className={`text-[12px] truncate ${isSelected ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
          {node.label}
        </span>

        {/* Node Type Badge */}
        <span className="text-[10px] text-outline ml-auto pr-2 hidden sm:inline">
          {node.type}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="children">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
