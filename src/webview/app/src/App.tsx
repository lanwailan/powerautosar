import { useEffect, useState } from 'react';
import { useEditorStore } from './store/editorStore';
import { useVscode } from './hooks/useVscode';
import { ConditionEditorModal } from './components/modals/ConditionEditorModal';
import { ReferenceSelectorModal } from './components/modals/ReferenceSelectorModal';
import { Splitter } from './components/Splitter';

interface TreeNode {
  id: string;
  label: string;
  type: string;
  children?: TreeNode[];
}

interface PropertyItem {
  key: string;
  value: string;
}

interface Diagnostic {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

// Material Symbols helper
const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined text-[16px] ${className}`} data-icon={name}>
    {name}
  </span>
);

export function App() {
  const {
    currentFileTree,
    selectedNodeId,
    selectedNodeDetail,
    indexStatus,
    diagnostics,
    expandedNodeIds,
    toggleNodeExpand,
    conditionEditorModalOpen,
    conditionEditorAttribute,
    conditionEditorExpression,
    conditionEditorVariables,
    referenceSelectorModalOpen,
    referenceSelectorTitle,
    referenceSelectorOptions,
    referenceSelectorOnConfirm,
    closeConditionEditor,
    closeReferenceSelector,
    openConditionEditor,
    openReferenceSelector,
    showRawXml,
    rawXmlContent,
    setShowRawXml,
  } = useEditorStore();

  const { sendReady, selectNode, openRawXml } = useVscode();
  const [leftTab, setLeftTab] = useState<'ar-tree' | 'ecu-conf' | 'search'>('ar-tree');
  const [consoleTab, setConsoleTab] = useState<'console' | 'problems' | 'output'>('console');

  // Initialize on mount - send READY to extension after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      sendReady('');
    }, 100);
    return () => clearTimeout(timer);
  }, [sendReady]);

  const handleNodeSelect = (nodeId: string) => {
    selectNode(nodeId);
  };

  // Recursive tree render
  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isSelected = node.id === selectedNodeId;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodeIds.has(node.id);

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        toggleNodeExpand(node.id);
      }
    };

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 py-0.5 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-500/10 border-l-2 border-blue-500'
              : 'hover:bg-surface-bright/50'
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => handleNodeSelect(node.id)}
        >
          <span
            onClick={handleToggle}
            className={`transition-transform ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {hasChildren ? (
              <Icon name={isExpanded ? 'expand_more' : 'chevron_right'} className="text-outline" />
            ) : (
              <Icon name="chevron_right" className="text-outline-variant opacity-0" />
            )}
          </span>
          <Icon
            name={node.type === 'PACKAGE' ? 'account_tree' : 'description'}
            className={node.type === 'PACKAGE' ? 'text-yellow-500/70' : 'text-blue-400'}
          />
          <span className={`text-[12px] ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}>
            {node.label}
          </span>
        </div>
        {hasChildren && isExpanded && node.children?.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  // Mock quick properties from selected node
  const quickProperties: PropertyItem[] = selectedNodeDetail
    ? [
        { key: 'Element ID', value: selectedNodeDetail.id },
        { key: 'Type', value: selectedNodeDetail.type },
        { key: 'Module', value: selectedNodeDetail.module },
      ]
    : [];

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;

  return (
    <div className="bg-background text-on-surface font-body h-screen flex flex-col overflow-hidden">
      {/* Main Layout with Splitters */}
      <main className="flex flex-1 overflow-hidden">
        <Splitter direction="horizontal" initialSize={25} minSize={15} maxSize={40}>
          {/* Left Sidebar */}
          <aside className="flex flex-col bg-surface-container-low h-full">
            <Splitter direction="vertical" initialSize={60} minSize={30} maxSize={80}>
              {/* AR Tree Section */}
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-outline-variant/10">
                  <button
                    className={`flex-1 py-2 text-[11px] font-bold tracking-wider transition-colors ${
                      leftTab === 'ar-tree' ? 'text-white border-b border-blue-500 bg-blue-500/5' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setLeftTab('ar-tree')}
                  >
                    AR TREE
                  </button>
                  <button
                    className={`flex-1 py-2 text-[11px] font-bold tracking-wider transition-colors ${
                      leftTab === 'ecu-conf' ? 'text-white border-b border-blue-500 bg-blue-500/5' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setLeftTab('ecu-conf')}
                  >
                    ECU CONF
                  </button>
                  <button
                    className={`flex-1 py-2 text-[11px] font-bold tracking-wider transition-colors ${
                      leftTab === 'search' ? 'text-white border-b border-blue-500 bg-blue-500/5' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setLeftTab('search')}
                  >
                    SEARCH
                  </button>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-y-auto technical-scroll p-4 space-y-0.5">
                  {leftTab === 'ar-tree' &&
                    currentFileTree.map((node) => renderTreeNode(node))}
                  {leftTab === 'ecu-conf' && (
                    <div className="text-on-surface-variant text-sm p-4">ECU Configuration placeholder</div>
                  )}
                  {leftTab === 'search' && (
                    <div className="text-on-surface-variant text-sm p-4">Search placeholder</div>
                  )}
                </div>
              </div>

              {/* Quick Properties Section */}
              <div className="flex flex-col bg-surface-container-lowest/20">
                <div className="px-4 py-2 bg-surface-container-low flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest text-on-tertiary-fixed-variant uppercase">
                    Quick Properties
                  </span>
                  <Icon name="dock_to_bottom" className="text-xs text-outline" />
                </div>
                <div className="p-4 space-y-3 overflow-y-auto technical-scroll flex-1">
                  {quickProperties.map((prop) => (
                    <div key={prop.key} className="space-y-1">
                      <label className="text-[10px] text-outline-variant uppercase font-bold">{prop.key}</label>
                      <p className="text-[12px] text-on-surface font-mono truncate">{prop.value}</p>
                    </div>
                  ))}
                  {!selectedNodeDetail && (
                    <p className="text-on-surface-variant text-xs">Select a node to view properties</p>
                  )}
                </div>
              </div>
            </Splitter>
          </aside>

          {/* Right Content Area */}
          <section className="flex flex-col bg-surface-container h-full">
            <Splitter direction="vertical" initialSize={75} minSize={40} maxSize={90}>
              {/* Attribute Grid */}
              <div className="flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex justify-between items-center bg-surface-container-high/50">
                  <h1 className="font-headline text-xl font-bold text-white tracking-tight">
                    {selectedNodeDetail ? selectedNodeDetail.displayName : 'ARXML Attribute Editor'}
                  </h1>
                  <div className="flex gap-2">
                    {showRawXml ? (
                      <button
                        onClick={() => setShowRawXml(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
                      >
                        <Icon name="arrow_back" className="text-sm" />
                        Back to Editor
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            if (selectedNodeId) {
                              openRawXml(selectedNodeId);
                              setShowRawXml(true);
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
                        >
                          <Icon name="code" className="text-sm" />
                          View Raw XML
                        </button>
                        <button className="p-1.5 rounded bg-surface-bright hover:bg-surface-container-highest transition-all">
                          <Icon name="save" className="text-sm" />
                        </button>
                        <button className="p-1.5 rounded bg-surface-bright hover:bg-surface-container-highest transition-all">
                          <Icon name="history" className="text-sm" />
                        </button>
                        <div className="w-[1px] bg-outline-variant/30 mx-1"></div>
                        <button className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                          <Icon name="add" className="text-sm" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Raw XML View */}
                {showRawXml ? (
                  <div className="flex-1 overflow-auto technical-scroll px-6 pb-6">
                    <pre className="font-mono text-[11px] text-on-surface-variant bg-surface-container-lowest rounded-lg p-4 whitespace-pre-wrap">
                      {rawXmlContent || 'No XML content available'}
                    </pre>
                  </div>
                ) : (
                  /* Attribute Table */
                  <div className="flex-1 overflow-auto technical-scroll px-6 pb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/20">
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-fixed-variant">
                            Attribute Label
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-fixed-variant">
                            Value Input
                          </th>
                          <th className="px-2 py-3 w-10 text-center">
                            <Icon name="description" className="text-sm text-outline" />
                          </th>
                          <th className="px-2 py-3 w-10 text-center">
                            <Icon name="add" className="text-sm text-outline" />
                          </th>
                          <th className="px-2 py-3 w-10 text-center">
                            <Icon name="close" className="text-sm text-outline" />
                          </th>
                          <th className="px-2 py-3 w-10 text-center">
                            <Icon name="link" className="text-sm text-outline" />
                          </th>
                          <th className="px-2 py-3 w-10 text-center">
                            <Icon name="help_outline" className="text-sm text-outline" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {selectedNodeDetail?.properties.map((prop, index) => (
                          <tr
                            key={prop.key}
                            className={`${
                              index % 2 === 1 ? 'bg-surface-container-high/20' : ''
                            } hover:bg-surface-bright/30 transition-all group`}
                          >
                            <td className="px-4 py-3 text-[12px] font-medium text-on-surface-variant group-hover:text-white">
                              {prop.key}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                className="w-full bg-surface-container-lowest border-none rounded-sm text-[12px] py-1 px-2 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                                type="text"
                                value={prop.value}
                                readOnly
                              />
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => openConditionEditor(prop.key, prop.value, [])}
                                className="text-xs text-outline cursor-pointer hover:text-primary transition-colors"
                                title="Edit Condition"
                              >
                                <Icon name="description" />
                              </button>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => openConditionEditor(prop.key, prop.value, [])}
                                className="text-xs text-outline cursor-pointer hover:text-primary transition-colors"
                                title="Add"
                              >
                                <Icon name="add" />
                              </button>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button className="text-xs text-outline cursor-pointer hover:text-error transition-colors" title="Remove">
                                <Icon name="close" />
                              </button>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => openReferenceSelector(`Select Reference for ${prop.key}`, [{ id: '1', path: '/Path/To/Reference', selected: false }], (ids) => console.log('Selected:', ids))}
                                className="text-xs text-outline cursor-pointer hover:text-primary transition-colors"
                                title="Select Reference"
                              >
                                <Icon name="link" />
                              </button>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button className="text-xs text-outline cursor-pointer hover:text-primary transition-colors" title="Help">
                                <Icon name="help_outline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!selectedNodeDetail && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                              Select a node from the AR Tree to view its attributes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Console */}
              <div className="flex flex-col bg-surface-container-lowest">
                <div className="flex items-center gap-6 px-6 py-1.5 border-b border-outline-variant/5 bg-surface-container-low">
                  <button
                    className={`text-[10px] font-bold tracking-widest uppercase ${
                      consoleTab === 'console' ? 'text-primary border-b border-primary' : 'text-on-surface-variant hover:text-white transition-colors'
                    }`}
                    onClick={() => setConsoleTab('console')}
                  >
                    Console
                  </button>
                  <button
                    className={`text-[10px] font-bold tracking-widest uppercase ${
                      consoleTab === 'problems' ? 'text-primary border-b border-primary' : 'text-on-surface-variant hover:text-white transition-colors'
                    }`}
                    onClick={() => setConsoleTab('problems')}
                  >
                    Problems ({errorCount})
                  </button>
                  <button
                    className={`text-[10px] font-bold tracking-widest uppercase ${
                      consoleTab === 'output' ? 'text-primary border-b border-primary' : 'text-on-surface-variant hover:text-white transition-colors'
                    }`}
                    onClick={() => setConsoleTab('output')}
                  >
                    Output
                  </button>
                  <div className="ml-auto flex gap-4 text-outline-variant">
                    <Icon name="block" className="text-[14px] cursor-pointer hover:text-white" />
                    <Icon name="close" className="text-[14px] cursor-pointer hover:text-white" />
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] technical-scroll overflow-y-auto leading-relaxed">
                  {consoleTab === 'console' && (
                    <>
                      <p className="text-blue-400/80">[INFO] ARXML Parser Initialized...</p>
                      <p className="text-on-surface-variant">[DEBUG] Ready for attribute updates...</p>
                    </>
                  )}
                  {consoleTab === 'problems' &&
                    diagnostics.map((d: Diagnostic) => (
                      <p
                        key={d.id}
                        className={d.severity === 'error' ? 'text-error' : d.severity === 'warning' ? 'text-yellow-500' : 'text-on-surface-variant'}
                      >
                        [{d.severity.toUpperCase()}] {d.message}
                      </p>
                    ))}
                  {consoleTab === 'output' && (
                    <p className="text-on-surface-variant">[Output] Placeholder</p>
                  )}
                </div>
              </div>
            </Splitter>
          </section>
        </Splitter>
      </main>

      {/* Status indicator */}
      <div className="fixed bottom-2 right-2 text-[10px] text-on-surface-variant">
        {indexStatus === 'ready' ? (
          <span className="text-primary">● Ready</span>
        ) : (
          <span className="text-outline-variant">● {indexStatus}</span>
        )}
      </div>

      {/* Modals */}
      <ConditionEditorModal
        isOpen={conditionEditorModalOpen}
        onClose={closeConditionEditor}
        attributeName={conditionEditorAttribute || ''}
        expression={conditionEditorExpression}
        variables={conditionEditorVariables}
        onSave={(expr) => console.log('Save condition:', expr)}
      />
      <ReferenceSelectorModal
        isOpen={referenceSelectorModalOpen}
        onClose={closeReferenceSelector}
        title={referenceSelectorTitle}
        options={referenceSelectorOptions}
        onConfirm={referenceSelectorOnConfirm || (() => {})}
      />
    </div>
  );
}
