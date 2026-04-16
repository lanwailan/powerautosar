import type { ParseDiagnostic } from '../../types';

type ConsoleTab = 'console' | 'problems' | 'output';

interface ConsoleProps {
  logs: string[];
  diagnostics: ParseDiagnostic[];
  activeTab?: ConsoleTab;
  onTabChange?: (tab: ConsoleTab) => void;
}

function getLogColor(log: string): string {
  if (log.includes('[INFO]')) return 'text-primary-dim';
  if (log.includes('[SUCCESS]')) return 'text-[#4ADE80]';
  if (log.includes('[ERROR]')) return 'text-error';
  if (log.includes('[DEBUG]')) return 'text-on-surface-variant';
  return 'text-on-surface-variant';
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'error':
      return 'text-error';
    case 'warning':
      return 'text-[#FACC15]';
    default:
      return 'text-on-surface-variant';
  }
}

export function Console({ logs, diagnostics, activeTab = 'console', onTabChange }: ConsoleProps) {
  const tabs: { id: ConsoleTab; label: string; count?: number }[] = [
    { id: 'console', label: 'Console' },
    { id: 'problems', label: 'Problems', count: diagnostics.length },
    { id: 'output', label: 'Output' },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest border-t border-outline-variant/15">
      {/* Tabs */}
      <div className="flex items-center gap-6 px-6 py-1.5 border-b border-outline-variant/5 bg-surface-container-low">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b border-primary pb-0.5'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-[9px]">({tab.count})</span>
            )}
          </button>
        ))}
        <div className="ml-auto flex gap-4 text-outline-variant">
          <button className="hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[14px]">block</span>
          </button>
          <button className="hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 font-mono text-[11px] technical-scroll overflow-y-auto leading-relaxed">
        {activeTab === 'console' && logs.map((log, i) => (
          <p key={i} className={getLogColor(log)}>{log}</p>
        ))}
        {activeTab === 'problems' && diagnostics.map((d, i) => (
          <p key={i} className={getSeverityColor(d.severity)}>
            [{d.severity.toUpperCase()}] {d.code}: {d.message}
          </p>
        ))}
        {activeTab === 'output' && (
          <p className="text-on-surface-variant">[INFO] Ready for output...</p>
        )}
      </div>
    </div>
  );
}
