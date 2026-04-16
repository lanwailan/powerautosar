import { EditorInitDto, GraphDto, NodeDetailDto, ProjectModuleSummaryDto, TreeNodeDto } from './dto';
import { ParseDiagnostic } from '../models/diagnostics';
import { WorkspaceIndexStatus } from '../models/workspaceState';

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

