import type { RelationItemDto } from '../../types';

interface RelationsListProps {
  outgoingRelations: RelationItemDto[];
  incomingRelations: RelationItemDto[];
  onJumpToReference: (targetNodeId: string) => void;
}

export function RelationsList({
  outgoingRelations,
  incomingRelations,
  onJumpToReference,
}: RelationsListProps) {
  if (outgoingRelations.length === 0 && incomingRelations.length === 0) {
    return (
      <div className="text-xs text-on-surface-variant p-4 text-center bg-surface-container-low rounded-lg">
        No relations
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Outgoing Relations */}
      {outgoingRelations.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-wider text-outline font-bold px-2">
            Outgoing
          </h3>
          {outgoingRelations.map((rel) => (
            <div
              key={rel.referenceId}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                !rel.resolved
                  ? 'bg-error-container/20 border-l-2 border-error hover:bg-error-container/30'
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
              onClick={() => rel.targetNodeId && onJumpToReference(rel.targetNodeId)}
            >
              <span className="material-symbols-outlined text-primary text-sm">
                arrow_forward
              </span>
              <span className="font-mono text-[11px] text-on-surface flex-1 truncate">
                {rel.label}
              </span>
              {!rel.resolved && (
                <span className="text-[10px] px-1.5 py-0.5 bg-error/20 text-error rounded">
                  unresolved
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Incoming Relations */}
      {incomingRelations.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-wider text-outline font-bold px-2">
            Incoming
          </h3>
          {incomingRelations.map((rel) => (
            <div
              key={rel.referenceId}
              className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-lg border-l-2 border-outline hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-sm">
                arrow_back
              </span>
              <span className="font-mono text-[11px] text-on-surface flex-1 truncate">
                {rel.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
