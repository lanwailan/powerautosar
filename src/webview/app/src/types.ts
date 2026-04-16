// Re-export types from extension protocol
export interface TreeNodeDto {
  id: string;
  label: string;
  type: string;
  module?: string;
  children?: TreeNodeDto[];
}

export interface PropertyItemDto {
  key: string;
  value: string;
}

export interface RelationItemDto {
  referenceId: string;
  label: string;
  targetNodeId?: string;
  resolved: boolean;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
}

export interface NodeDetailDto {
  id: string;
  displayName: string;
  type: string;
  module: string;
  semanticPath: string;
  fileUri: string;
  properties: PropertyItemDto[];
  outgoingRelations: RelationItemDto[];
  incomingRelations: RelationItemDto[];
}

export interface ProjectModuleSummaryDto {
  module: string;
  nodeCount: number;
}

export interface GraphNodeDto {
  id: string;
  label: string;
  type: string;
  module: string;
}

export interface GraphEdgeDto {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface GraphDto {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
}

export interface ParseDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'error';
  code:
    | 'XML_PARSE_ERROR'
    | 'UNRESOLVED_REFERENCE'
    | 'DUPLICATE_SHORT_NAME'
    | 'UNKNOWN_MODULE'
    | 'UNSUPPORTED_PATTERN';
  message: string;
  fileUri: string;
  range?: SourceRange;
  nodeId?: string;
}

export interface SourceRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export type WorkspaceIndexStatus = 'idle' | 'scanning' | 'parsing' | 'ready' | 'error';

export interface EditorInitDto {
  fileUri: string;
  title: string;
  indexStatus: WorkspaceIndexStatus;
  currentFileTree: TreeNodeDto[];
  projectModules: ProjectModuleSummaryDto[];
  selectedNodeDetail?: NodeDetailDto;
  diagnostics: ParseDiagnostic[];
  graph?: GraphDto;
  breadcrumb: BreadcrumbItem[];
}

// Message Protocol
export type WebviewRequest =
  | { type: 'READY'; fileUri: string }
  | { type: 'GET_CURRENT_FILE_TREE'; fileUri: string }
  | { type: 'GET_PROJECT_VIEW' }
  | { type: 'SELECT_NODE'; nodeId: string }
  | { type: 'JUMP_TO_REFERENCE'; targetNodeId: string }
  | { type: 'OPEN_RAW_XML'; nodeId: string }
  | { type: 'GET_GRAPH'; nodeId: string; depth: number };

export type ExtensionEvent =
  | { type: 'INIT_DATA'; payload: EditorInitDto }
  | { type: 'CURRENT_FILE_TREE'; payload: TreeNodeDto[] }
  | { type: 'PROJECT_VIEW'; payload: ProjectModuleSummaryDto[] }
  | { type: 'NODE_DETAIL'; payload: NodeDetailDto }
  | { type: 'GRAPH_DATA'; payload: GraphDto }
  | { type: 'DIAGNOSTICS'; payload: ParseDiagnostic[] }
  | { type: 'INDEX_STATUS'; payload: { status: WorkspaceIndexStatus } }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'RAW_XML_CONTENT'; payload: { nodeId: string; xmlContent: string } };
