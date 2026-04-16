import type { NodeDetailDto } from '../types';

interface NodeDetailPanelProps {
  detail: NodeDetailDto | undefined;
  onJumpToReference: (targetNodeId: string) => void;
}

export function NodeDetailPanel({ detail, onJumpToReference }: NodeDetailPanelProps) {
  if (!detail) {
    return (
      <div className="detail-panel">
        <div className="empty-state muted">Select a node to view details</div>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title">{detail.displayName}</div>
        <div className="detail-meta muted">
          {detail.type} · {detail.module}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Semantic Path</div>
        <div className="detail-semantic-path muted">{detail.semanticPath}</div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Properties</div>
        <div className="properties-list">
          {detail.properties.length === 0 ? (
            <div className="empty-state muted">No properties</div>
          ) : (
            detail.properties.map((prop) => (
              <div key={prop.key} className="property-item">
                <span className="property-key">{prop.key}:</span>
                <span className="property-value">{prop.value}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          Relations ({detail.outgoingRelations.length + detail.incomingRelations.length})
        </div>
        <div className="relations-list">
          {detail.outgoingRelations.length === 0 && detail.incomingRelations.length === 0 ? (
            <div className="empty-state muted">No relations</div>
          ) : (
            <>
              {detail.outgoingRelations.map((rel) => (
                <div
                  key={rel.referenceId}
                  className={`relation-item ${!rel.resolved ? 'unresolved' : ''}`}
                  onClick={() => rel.targetNodeId && onJumpToReference(rel.targetNodeId)}
                >
                  <span className="relation-arrow">→</span>
                  <span className="relation-label">{rel.label}</span>
                  {!rel.resolved && <span className="relation-badge">unresolved</span>}
                </div>
              ))}
              {detail.incomingRelations.map((rel) => (
                <div key={rel.referenceId} className="relation-item incoming">
                  <span className="relation-arrow">←</span>
                  <span className="relation-label">{rel.label}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
