import { create } from 'zustand';
import type {
  TreeNodeDto,
  NodeDetailDto,
  ProjectModuleSummaryDto,
  GraphDto,
  ParseDiagnostic,
  BreadcrumbItem,
  WorkspaceIndexStatus,
} from '../types';

export type LeftTab = 'current-file' | 'project-view';

interface EditorState {
  // File context
  currentFileUri: string;
  title: string;

  // UI state
  activeLeftTab: LeftTab;
  selectedNodeId: string | undefined;
  expandedNodeIds: Set<string>;
  consoleTab: 'console' | 'problems' | 'output';

  // Data
  currentFileTree: TreeNodeDto[];
  projectModules: ProjectModuleSummaryDto[];
  selectedNodeDetail: NodeDetailDto | undefined;
  graphData: GraphDto | undefined;
  breadcrumb: BreadcrumbItem[];
  diagnostics: ParseDiagnostic[];

  // Status
  indexStatus: WorkspaceIndexStatus;
  loading: boolean;
  error: string | undefined;

  // Modal state
  conditionEditorModalOpen: boolean;
  conditionEditorAttribute: string | undefined;
  conditionEditorExpression: string;
  conditionEditorVariables: { name: string; value: string }[];
  referenceSelectorModalOpen: boolean;
  referenceSelectorTitle: string;
  referenceSelectorOptions: { id: string; path: string; selected: boolean }[];
  referenceSelectorOnConfirm: ((selectedIds: string[]) => void) | undefined;

  // Raw XML view state
  showRawXml: boolean;
  rawXmlContent: string;

  // Actions
  setFileUri: (uri: string) => void;
  setTitle: (title: string) => void;
  setActiveLeftTab: (tab: LeftTab) => void;
  selectNode: (nodeId: string | undefined) => void;
  toggleNodeExpand: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  setConsoleTab: (tab: 'console' | 'problems' | 'output') => void;
  setCurrentFileTree: (tree: TreeNodeDto[]) => void;
  setProjectModules: (modules: ProjectModuleSummaryDto[]) => void;
  setSelectedNodeDetail: (detail: NodeDetailDto | undefined) => void;
  setGraphData: (graph: GraphDto | undefined) => void;
  setBreadcrumb: (crumb: BreadcrumbItem[]) => void;
  setDiagnostics: (diagnostics: ParseDiagnostic[]) => void;
  setIndexStatus: (status: WorkspaceIndexStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  initFromPayload: (payload: import('../types').EditorInitDto) => void;
  openConditionEditor: (attribute: string, expression: string, variables: { name: string; value: string }[]) => void;
  closeConditionEditor: () => void;
  openReferenceSelector: (title: string, options: { id: string; path: string; selected: boolean }[], onConfirm: (selectedIds: string[]) => void) => void;
  closeReferenceSelector: () => void;
  setShowRawXml: (show: boolean) => void;
  setRawXmlContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  currentFileUri: '',
  title: 'ARXML Architect',
  activeLeftTab: 'current-file',
  selectedNodeId: undefined,
  expandedNodeIds: new Set<string>(),
  consoleTab: 'console',
  currentFileTree: [],
  projectModules: [],
  selectedNodeDetail: undefined,
  graphData: undefined,
  breadcrumb: [],
  diagnostics: [],
  indexStatus: 'idle',
  loading: false,
  error: undefined,
  conditionEditorModalOpen: false,
  conditionEditorAttribute: undefined,
  conditionEditorExpression: '',
  conditionEditorVariables: [],
  referenceSelectorModalOpen: false,
  referenceSelectorTitle: '',
  referenceSelectorOptions: [],
  referenceSelectorOnConfirm: undefined,
  showRawXml: false,
  rawXmlContent: '',

  // Actions
  setFileUri: (uri) => set({ currentFileUri: uri }),
  setTitle: (title) => set({ title }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  toggleNodeExpand: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodeIds: newExpanded };
    }),
  expandNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      newExpanded.add(nodeId);
      return { expandedNodeIds: newExpanded };
    }),
  collapseNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodeIds);
      newExpanded.delete(nodeId);
      return { expandedNodeIds: newExpanded };
    }),
  setConsoleTab: (tab) => set({ consoleTab: tab }),
  setCurrentFileTree: (tree) => set({ currentFileTree: tree }),
  setProjectModules: (modules) => set({ projectModules: modules }),
  setSelectedNodeDetail: (detail) => set({ selectedNodeDetail: detail }),
  setGraphData: (graph) => set({ graphData: graph }),
  setBreadcrumb: (crumb) => set({ breadcrumb: crumb }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setIndexStatus: (status) => set({ indexStatus: status }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initFromPayload: (payload) =>
    set({
      currentFileUri: payload.fileUri,
      title: payload.title,
      indexStatus: payload.indexStatus,
      currentFileTree: payload.currentFileTree,
      projectModules: payload.projectModules,
      selectedNodeId: payload.selectedNodeDetail?.id,
      selectedNodeDetail: payload.selectedNodeDetail,
      graphData: payload.graph,
      breadcrumb: payload.breadcrumb,
      diagnostics: payload.diagnostics,
    }),
  openConditionEditor: (attribute, expression, variables) =>
    set({
      conditionEditorModalOpen: true,
      conditionEditorAttribute: attribute,
      conditionEditorExpression: expression,
      conditionEditorVariables: variables,
    }),
  closeConditionEditor: () =>
    set({
      conditionEditorModalOpen: false,
      conditionEditorAttribute: undefined,
      conditionEditorExpression: '',
      conditionEditorVariables: [],
    }),
  openReferenceSelector: (title, options, onConfirm) =>
    set({
      referenceSelectorModalOpen: true,
      referenceSelectorTitle: title,
      referenceSelectorOptions: options,
      referenceSelectorOnConfirm: onConfirm,
    }),
  closeReferenceSelector: () =>
    set({
      referenceSelectorModalOpen: false,
      referenceSelectorTitle: '',
      referenceSelectorOptions: [],
      referenceSelectorOnConfirm: undefined,
    }),
  setShowRawXml: (show) => set({ showRawXml: show }),
  setRawXmlContent: (content) => set({ rawXmlContent: content }),
}));

// Selectors
export const selectSelectedNode = (state: EditorState) => state.selectedNodeDetail;
export const selectIsNodeExpanded = (nodeId: string) => (state: EditorState) =>
  state.expandedNodeIds.has(nodeId);
export const selectBreadcrumb = (state: EditorState) => state.breadcrumb;
export const selectDiagnosticsCount = (state: EditorState) => state.diagnostics.length;
