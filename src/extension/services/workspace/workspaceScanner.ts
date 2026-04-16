import * as vscode from 'vscode';

import { WorkspaceIndexService } from '../index/workspaceIndexService';

export class WorkspaceScanner implements vscode.Disposable {
  private watcher: vscode.FileSystemWatcher | undefined;

  constructor(private readonly indexService: WorkspaceIndexService) {}

  async initialize(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    await this.indexService.initialize(folders);
    await this.indexService.rebuildAll();

    this.watcher = vscode.workspace.createFileSystemWatcher('**/*.arxml');
    this.watcher.onDidCreate((uri) => void this.indexService.updateFile(uri));
    this.watcher.onDidChange((uri) => void this.indexService.updateFile(uri));
    this.watcher.onDidDelete((uri) => void this.indexService.removeFile(uri.toString()));
  }

  dispose(): void {
    this.watcher?.dispose();
  }
}

