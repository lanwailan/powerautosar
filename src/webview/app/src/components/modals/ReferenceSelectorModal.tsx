import { useState, useMemo } from 'react';
import { Modal } from './Modal';

interface ReferenceOption {
  id: string;
  path: string;
  selected: boolean;
}

interface ReferenceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: ReferenceOption[];
  onConfirm: (selectedIds: string[]) => void;
}

function Checkbox({ checked, onChange, size = 'md' }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const iconSize = size === 'sm' ? 'text-[10px]' : 'text-[12px]';

  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        className="peer appearance-none border border-outline-variant bg-surface-container-lowest rounded-sm checked:bg-primary checked:border-primary transition-all cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`absolute material-symbols-outlined ${iconSize} text-on-primary opacity-0 peer-checked:opacity-100 pointer-events-none`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check
      </span>
    </div>
  );
}

export function ReferenceSelectorModal({
  isOpen,
  onClose,
  title,
  options: initialOptions,
  onConfirm,
}: ReferenceSelectorModalProps) {
  const [options, setOptions] = useState<ReferenceOption[]>(initialOptions);
  const [showFullPath, setShowFullPath] = useState(false);
  const [showSelectedValues, setShowSelectedValues] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.path.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleToggle = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, selected: !opt.selected } : opt
      )
    );
  };

  const handleSelectAll = () => {
    setOptions((prev) => prev.map((opt) => ({ ...opt, selected: true })));
  };

  const handleUnselectAll = () => {
    setOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })));
  };

  const handleConfirm = () => {
    const selectedIds = options.filter((opt) => opt.selected).map((opt) => opt.id);
    onConfirm(selectedIds);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Discard Select
          </button>
          <button className="btn-primary" onClick={handleConfirm}>
            Confirm Select
          </button>
        </>
      }
    >
      <div className="flex flex-col">
        {/* Checkboxes Row */}
        <div className="flex items-center gap-8 px-6 py-4 bg-surface-container border-b border-outline-variant/15">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={showFullPath}
              onChange={setShowFullPath}
            />
            <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
              Show full path
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={showSelectedValues}
              onChange={setShowSelectedValues}
            />
            <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
              Show selected values
            </span>
          </label>
        </div>

        {/* Search */}
        <div className="px-6 py-4 bg-surface-container">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="Search paths..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Options List */}
        <div className="flex-grow h-80 overflow-y-auto custom-scrollbar rounded-lg border border-outline-variant/10 bg-surface-container-low mx-6 my-4">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-transparent">
              {filteredOptions.map((option, index) => (
                <tr
                  key={option.id}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? 'hover:bg-surface-bright'
                      : 'bg-surface-container-high/40 hover:bg-surface-bright'
                  }`}
                >
                  <td className="py-1.5 align-middle pl-8 pr-4">
                    <Checkbox
                      checked={option.selected}
                      onChange={() => handleToggle(option.id)}
                      size="sm"
                    />
                  </td>
                  <td
                    className={`px-4 py-1.5 font-mono text-[11px] ${
                      option.selected
                        ? 'text-primary'
                        : 'text-on-surface-variant group-hover:text-on-surface'
                    }`}
                  >
                    {option.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Select All/Unselect All */}
        <div className="px-6 py-4 flex gap-3 bg-surface-container">
          <button className="btn-secondary" onClick={handleSelectAll}>
            Select ALL
          </button>
          <button className="btn-secondary" onClick={handleUnselectAll}>
            Unselect ALL
          </button>
        </div>
      </div>
    </Modal>
  );
}
