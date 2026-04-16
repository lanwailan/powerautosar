import { ParseDiagnostic } from '../models/diagnostics';
import { ArxmlReference } from '../models/reference';
import { WorkspaceIndexStatus } from '../models/workspaceState';

export interface TreeNodeDto {
  id: string;
  label: string;
  type: string;
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

export interface ArxmlFileParseResult {
  fileUri: string;
  checksum: string;
  parsedAt: number;
  nodes: import('../models/normalizedNode').NormalizedArxmlNode[];
  references: ArxmlReference[];
  diagnostics: ParseDiagnostic[];
}

