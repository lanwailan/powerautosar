import { useState, useCallback, useRef, useEffect } from 'react';

interface SplitterProps {
  direction: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
  children: [React.ReactNode, React.ReactNode];
}

export function Splitter({
  direction,
  initialSize = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
  children,
}: SplitterProps) {
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === 'horizontal') {
        newSize = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newSize = ((e.clientY - rect.top) / rect.height) * 100;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
      onResize?.(newSize);
    },
    [isDragging, direction, minSize, maxSize, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isHorizontal = direction === 'horizontal';

  const firstPaneStyle: React.CSSProperties = isHorizontal
    ? { width: `${size}%` }
    : { height: `${size}%` };

  const secondPaneStyle: React.CSSProperties = isHorizontal
    ? { width: `${100 - size}%` }
    : { height: `${100 - size}%` };

  const splitterClass = isHorizontal
    ? 'w-1 hover:w-1.5 cursor-col-resize'
    : 'h-1 hover:h-1.5 cursor-row-resize';

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} w-full h-full`}
    >
      <div style={firstPaneStyle} className="overflow-hidden">
        {children[0]}
      </div>
      <div
        className={`flex-shrink-0 bg-outline-variant/30 transition-colors ${splitterClass} ${
          isDragging ? 'bg-primary' : 'hover:bg-primary/50'
        }`}
        onMouseDown={handleMouseDown}
      />
      <div style={secondPaneStyle} className="overflow-hidden">
        {children[1]}
      </div>
    </div>
  );
}
