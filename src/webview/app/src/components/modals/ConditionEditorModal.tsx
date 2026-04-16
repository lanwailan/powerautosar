import { useState } from 'react';
import { Modal } from './Modal';

interface ConditionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  attributeName: string;
  expression: string;
  variables: { name: string; value: string }[];
  onSave: (expression: string) => void;
}

export function ConditionEditorModal({
  isOpen,
  onClose,
  attributeName,
  expression,
  variables,
  onSave,
}: ConditionEditorModalProps) {
  const [localExpression, setLocalExpression] = useState(expression);

  const handleSave = () => {
    onSave(localExpression);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="rule"
      iconFilled
      title={
        <>
          Condition Editor for Attribute:{' '}
          <span className="text-primary-dim">{attributeName}</span>
        </>
      }
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Discard Changes
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Confirm Logic
          </button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {/* Expression Logic */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant font-bold">
            Expression Logic
          </label>
          <div className="w-full h-48 bg-surface-container-lowest font-mono text-sm rounded-lg border border-primary/20 ring-1 ring-primary/5 shadow-inner p-4">
            <textarea
              className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-on-surface font-mono"
              value={localExpression}
              onChange={(e) => setLocalExpression(e.target.value)}
            />
          </div>
        </div>

        {/* Runtime Context */}
        <div className="space-y-3">
          <label className="block text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant font-bold">
            Runtime Context
          </label>
          <div className="overflow-hidden border border-outline-variant/10 rounded-lg bg-surface-container/20">
            <table className="text-left border-collapse min-w-[300px]">
              <thead className="bg-surface-container-high/40">
                <tr>
                  <th className="px-4 py-2 font-headline text-[10px] uppercase tracking-wider text-on-tertiary-fixed-variant border-b border-outline-variant/10 w-48">
                    Variable
                  </th>
                  <th className="px-4 py-2 font-headline text-[10px] uppercase tracking-wider text-on-tertiary-fixed-variant border-b border-outline-variant/10 text-left">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {variables.map((v) => (
                  <tr key={v.name} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="material-symbols-outlined text-[14px] text-outline">
                          data_object
                        </span>
                        <span className="font-mono text-xs text-on-surface-variant">
                          {v.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-left">
                      <span className="font-mono text-xs text-primary font-bold">
                        {v.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result Status */}
        <div className="flex items-center space-x-4 bg-surface-container-high/50 p-4 rounded-lg border-l-4 border-[#4ADE80]">
          <span
            className="material-symbols-outlined text-[#4ADE80]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-outline font-bold">
              Evaluation Status
            </p>
            <p className="text-sm font-headline font-bold text-on-surface">
              Result: <span className="text-[#4ADE80]">TRUE</span>
            </p>
          </div>
          <div className="ml-auto text-[10px] font-mono text-outline">
            Execution time: 0.4ms
          </div>
        </div>
      </div>
    </Modal>
  );
}
