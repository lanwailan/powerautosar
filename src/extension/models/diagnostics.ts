export interface SourceRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
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

