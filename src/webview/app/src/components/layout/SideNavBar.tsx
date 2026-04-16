import type { LeftTab } from '../../store/editorStore';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  filledIcon?: boolean;
}

interface SideNavBarProps {
  activeTab: string;
  onTabChange: (tab: LeftTab) => void;
  version?: string;
}

const navItems: NavItem[] = [
  { id: 'tree-view', label: 'Tree View', icon: 'account_tree', filledIcon: true },
  { id: 'signals', label: 'Signals', icon: 'sensors' },
  { id: 'functions', label: 'Functions', icon: 'functions' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'constants', label: 'Constants', icon: 'category' },
];

const bottomNavItems: NavItem[] = [
  { id: 'diagnostics', label: 'Diagnostics', icon: 'monitor_heart' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
];

export function SideNavBar({ activeTab, onTabChange, version = 'V3.4.0-Release' }: SideNavBarProps) {
  const isTreeViewActive = activeTab === 'current-file' || activeTab === 'project-view';

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col justify-between py-4 z-40">
      {/* Top section */}
      <div className="space-y-1">
        <div className="px-4 py-2 mb-4">
          <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant">
            Project Workspace
          </p>
          <p className="text-[10px] text-outline">{version}</p>
        </div>

        {/* Primary nav items */}
        <button
          className={`w-full flex items-center space-x-3 px-4 py-2 font-label text-xs font-medium transition-all ${
            isTreeViewActive
              ? 'bg-surface-container text-primary border-l-2 border-primary'
              : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface'
          }`}
          onClick={() => onTabChange('current-file')}
        >
          <span
            className={`material-symbols-outlined ${isTreeViewActive ? 'text-primary' : ''}`}
            style={isTreeViewActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            account_tree
          </span>
          <span>Tree View</span>
        </button>

        {navItems.slice(1).map((item) => (
          <button
            key={item.id}
            className="w-full text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface flex items-center space-x-3 px-4 py-2 font-label text-xs font-medium transition-all"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom section */}
      <div className="space-y-1 px-4">
        <button className="w-full bg-primary-container text-on-primary-container py-2 rounded text-xs font-bold mb-4 hover:opacity-90 transition-opacity">
          Deploy Logic
        </button>

        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              className="w-full text-on-surface-variant hover:text-on-surface flex items-center space-x-3 py-1 font-label text-[10px] uppercase tracking-wider transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
