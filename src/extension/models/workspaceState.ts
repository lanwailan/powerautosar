export type WorkspaceIndexStatus = 'idle' | 'scanning' | 'parsing' | 'ready' | 'error';

export interface WorkspaceIndexState {
  status: WorkspaceIndexStatus;
  lastUpdatedAt?: number;
  message?: string;
}

