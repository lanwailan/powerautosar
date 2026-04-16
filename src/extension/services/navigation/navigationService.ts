import * as vscode from 'vscode';

import { WorkspaceIndexService } from '../index/workspaceIndexService';

export class NavigationService {
  constructor(private readonly indexService: WorkspaceIndexService) {}

  async jumpToNode(nodeId: string): Promise<void> {
    const node = this.indexService.getNode(nodeId);
    if (!node) {
      void vscode.window.showWarningMessage(`Unable to resolve node: ${nodeId}`);
      return;
    }

    const uri = vscode.Uri.parse(node.fileUri);
    await vscode.commands.executeCommand('vscode.openWith', uri, 'autosarArxml.editor');
  }

  async openRawXmlAtNode(nodeId: string): Promise<void> {
    const node = this.indexService.getNode(nodeId);
    if (!node) {
      return;
    }

    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(node.fileUri));
    await vscode.window.showTextDocument(document, { preview: false });
  }
}

