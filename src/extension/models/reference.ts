export interface ArPath {
  raw: string;
  segments: string[];
  normalized: string;
  packagePath: string;
  leafName: string;
  absolute: boolean;
}

export interface ArPathResolutionResult {
  arPath: ArPath;
  resolved: boolean;
  targetNodeId?: string;
  targetSemanticPath?: string;
  reason?: 'NOT_FOUND' | 'AMBIGUOUS' | 'PARTIAL_IMPORT' | 'INVALID_PATH';
}

export interface ArxmlReference {
  id: string;
  sourceNodeId: string;
  sourceField: string;
  targetRef: string;
  arPath?: string;
  targetNodeId?: string;
  resolved: boolean;
  relationType: 'contains' | 'config-ref' | 'definition-ref' | 'instance-ref' | 'foreign';
  metadata?: Record<string, string>;
}

