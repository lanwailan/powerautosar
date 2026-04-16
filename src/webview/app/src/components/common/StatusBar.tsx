import type { WorkspaceIndexStatus } from '../../types';

interface StatusBarProps {
  status: WorkspaceIndexStatus;
  title: string;
  error: string | undefined;
  diagnosticsCount?: number;
}

export function StatusBar({ status, title, error, diagnosticsCount = 0 }: StatusBarProps) {
  const getStatusText = () => {
    if (error) return `Error: ${error}`;
    switch (status) {
      case 'idle':
        return 'Idle';
      case 'scanning':
        return 'Scanning workspace...';
      case 'parsing':
        return 'Parsing ARXML files...';
      case 'ready':
        return 'Index ready';
      case 'error':
        return 'Index error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (error) return 'bg-error-container/30 text-error';
    switch (status) {
      case 'ready':
        return 'bg-primary-container/30 text-primary';
      case 'scanning':
      case 'parsing':
        return 'bg-secondary-container/30 text-secondary';
      case 'error':
        return 'bg-error-container/30 text-error';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-surface-container-high/50 border-b border-outline-variant/10">
      <span className="font-headline text-sm font-semibold text-on-surface">
        {title}
      </span>
      <div className="flex items-center gap-4">
        {diagnosticsCount > 0 && (
          <span className="text-xs px-2 py-0.5 bg-error-container/30 text-error rounded-full">
            {diagnosticsCount} issues
          </span>
        )}
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
