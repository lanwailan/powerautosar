import { useEffect, useRef } from 'react';
import type { GraphDto } from '../types';
import type cytoscapeType from 'cytoscape';

interface MiniGraphProps {
  data: GraphDto | undefined;
}

export function MiniGraph({ data }: MiniGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    let cy: cytoscapeType.Core | undefined;

    import('cytoscape').then((cytoscapeModule) => {
      const cytoscape = cytoscapeModule.default ?? cytoscapeModule;
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = '';

      const elements: cytoscapeType.ElementDefinition[] = [
        ...data.nodes.map((node) => ({
          data: { id: node.id, label: node.label },
        })),
        ...data.edges.map((edge) => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
          },
        })),
      ];

      if (elements.length === 0) {
        container.innerHTML = '<div class="text-center p-4 text-on-surface-variant text-xs">No graph data</div>';
        return;
      }

      cy = cytoscape({
        container,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'background-color': '#9fcaff',
              color: '#e6e4ef',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '10px',
              width: 30,
              height: 30,
            },
          },
          {
            selector: 'edge',
            style: {
              label: 'data(label)',
              width: 1.5,
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.8,
              'line-color': '#75757e',
              'target-arrow-color': '#75757e',
              'font-size': '9px',
              color: '#abaab4',
            },
          },
        ],
        layout: {
          name: 'breadthfirst',
          directed: true,
          padding: 20,
        },
        wheelSensitivity: 0.3,
      });

      cy.on('tap', 'node', (event: cytoscapeType.EventObject) => {
        const nodeId = event.target.id();
        window.vscode.postMessage({ type: 'SELECT_NODE', nodeId });
      });
    });

    return () => {
      cy?.destroy();
    };
  }, [data]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="h-full min-h-[180px] bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center">
        <span className="text-on-surface-variant text-xs">Select a node to view graph</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[180px] bg-surface-container-low rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
