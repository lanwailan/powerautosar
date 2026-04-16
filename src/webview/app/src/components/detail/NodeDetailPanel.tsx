import type { NodeDetailDto } from '../../types';
import { PropertyList } from './PropertyList';
import { RelationsList } from './RelationsList';

interface NodeDetailPanelProps {
  detail: NodeDetailDto | undefined;
  onJumpToReference: (targetNodeId: string) => void;
  onOpenRawXml?: (nodeId: string) => void;
}

export function NodeDetailPanel({
  detail,
  onJumpToReference,
  onOpenRawXml,
}: NodeDetailPanelProps) {
  if (!detail) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
        Select a node to view details
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto technical-scroll p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
          {detail.displayName}
        </h1>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="px-2 py-0.5 bg-surface-container rounded text-primary">
            {detail.type}
          </span>
          <span>{detail.module}</span>
        </div>
      </div>

      {/* Semantic Path */}
      <section className="space-y-2">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant font-bold">
          Semantic Path
        </h2>
        <div
          className="font-mono text-xs bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 text-on-surface break-all cursor-pointer hover:bg-surface-container transition-colors"
          onClick={() => onOpenRawXml?.(detail.id)}
          title="Click to view raw XML"
        >
          {detail.semanticPath}
        </div>
      </section>

      {/* Properties */}
      <section className="space-y-2">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant font-bold">
          Properties
        </h2>
        <PropertyList properties={detail.properties} />
      </section>

      {/* Relations */}
      <section className="space-y-2">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant font-bold">
          Relations ({detail.outgoingRelations.length + detail.incomingRelations.length})
        </h2>
        <RelationsList
          outgoingRelations={detail.outgoingRelations}
          incomingRelations={detail.incomingRelations}
          onJumpToReference={onJumpToReference}
        />
      </section>
    </div>
  );
}
