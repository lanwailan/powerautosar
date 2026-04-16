import type { ProjectModuleSummaryDto } from '../types';

interface ProjectModuleViewProps {
  modules: ProjectModuleSummaryDto[];
}

export function ProjectModuleView({ modules }: ProjectModuleViewProps) {
  if (modules.length === 0) {
    return (
      <div className="p-4 text-center text-on-surface-variant text-xs">
        No modules found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {modules
        .filter((m) => m.module !== 'Unknown')
        .sort((a, b) => b.nodeCount - a.nodeCount)
        .map((module) => (
          <div
            key={module.module}
            className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="text-on-surface font-medium text-xs">{module.module}</span>
            <span className="text-on-surface-variant text-xs">{module.nodeCount} nodes</span>
          </div>
        ))}
      {modules.some((m) => m.module === 'Unknown') && (
        <>
          <div className="h-px bg-outline-variant/30 my-2" />
          <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg opacity-60">
            <span className="text-on-surface font-medium text-xs">Unknown</span>
            <span className="text-on-surface-variant text-xs">
              {modules.find((m) => m.module === 'Unknown')?.nodeCount ?? 0} nodes
            </span>
          </div>
        </>
      )}
    </div>
  );
}
