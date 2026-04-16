import type { PropertyItemDto } from '../../types';

interface PropertyListProps {
  properties: PropertyItemDto[];
}

export function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-xs text-on-surface-variant p-4 text-center bg-surface-container-low rounded-lg">
        No properties
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {properties.map((prop) => (
        <div
          key={prop.key}
          className="flex gap-4 p-2.5 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="text-primary font-medium text-xs min-w-[120px]">
            {prop.key}:
          </span>
          <span className="text-on-surface text-xs break-all font-mono">
            {prop.value}
          </span>
        </div>
      ))}
    </div>
  );
}
