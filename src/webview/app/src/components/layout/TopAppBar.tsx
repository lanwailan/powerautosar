interface TopAppBarProps {
  title: string;
  onSearch?: (query: string) => void;
}

export function TopAppBar({ title, onSearch }: TopAppBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low border-b border-outline-variant/15 flex justify-between items-center h-14 px-6">
      {/* Left: Title and Nav */}
      <div className="flex items-center space-x-8">
        <span className="font-headline text-lg font-bold text-on-surface tracking-wider">
          {title}
        </span>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            className="text-primary border-b-2 border-primary pb-1 cursor-pointer active:opacity-80"
            href="#"
          >
            Explorer
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer active:opacity-80"
            href="#"
          >
            Parser
          </a>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer active:opacity-80"
            href="#"
          >
            Validation
          </a>
        </nav>
      </div>

      {/* Right: Search and Actions */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center bg-surface-container-lowest border border-outline-variant/30 px-3 py-1 rounded">
          <span className="material-symbols-outlined text-xs text-on-surface-variant mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-xs w-48 text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Search components..."
            type="text"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <button className="icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="icon-btn">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="icon-btn">
          <span className="material-symbols-outlined">account_tree</span>
        </button>
      </div>
    </header>
  );
}
