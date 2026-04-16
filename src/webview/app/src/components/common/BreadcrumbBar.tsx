import type { BreadcrumbItem } from '../../types';

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  onItemClick?: (id: string) => void;
}

export function BreadcrumbBar({ items, onItemClick }: BreadcrumbBarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center px-6 py-2 bg-surface-container-low border-b border-outline-variant/15 text-[11px] font-medium text-on-surface-variant">
      {items.map((item, index) => (
        <span key={item.id} className="flex items-center gap-1.5">
          {index > 0 && <span className="mx-2 text-outline-variant">/</span>}
          <button
            className={`hover:text-on-surface cursor-pointer transition-colors ${
              index === items.length - 1 ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => onItemClick?.(item.id)}
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}
