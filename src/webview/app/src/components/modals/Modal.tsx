import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  icon?: string;
  iconFilled?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, icon, iconFilled, children, footer }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-backdrop"
        onClick={onClose}
      />
      <div
        className="modal-container max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-lowest/50 border-b border-outline-variant/10">
            <div className="flex items-center space-x-3">
              {icon && (
                <span
                  className="material-symbols-outlined text-primary-dim"
                  style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
              )}
              <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">
                {title}
              </h2>
            </div>
            <button
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 mt-auto flex justify-end items-center space-x-4 bg-surface-container-low/30 border-t border-outline-variant/10">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
