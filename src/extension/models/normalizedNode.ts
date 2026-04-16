import { SourceRange } from './diagnostics';

export type ArxmlModule =
  | 'Can'
  | 'CanIf'
  | 'Com'
  | 'PduR'
  | 'Dcm'
  | 'Dem'
  | 'EcuC'
  | 'Os'
  | 'Unknown';

export type ArxmlValue =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'enum'; value: string }
  | { kind: 'reference'; value: string; targetNodeId?: string }
  | { kind: 'list'; value: ArxmlValue[] }
  | { kind: 'object'; value: Record<string, ArxmlValue> };

export interface NodeMeta {
  schemaType?: string;
  vendorExtension?: boolean;
  variationPoint?: string;
  warnings: string[];
}

export interface NormalizedArxmlNode {
  id: string;
  workspaceId: string;
  fileUri: string;
  xmlPath: string;
  semanticPath: string;
  module: ArxmlModule;
  type: string;
  category: string;
  shortName?: string;
  displayName: string;
  attributes: Record<string, ArxmlValue>;
  childIds: string[];
  referenceIds: string[];
  sourceRange?: SourceRange;
  sourceLine?: number;
  sourceColumn?: number;
  meta: NodeMeta;
}

