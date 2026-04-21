import * as vscode from 'vscode';
import { WorkspaceIndexService } from '../services/index/workspaceIndexService';

export class ExtensionTreeDataProvider implements vscode.TreeDataProvider<ExtensionTreeItem> {
  private readonly indexService: WorkspaceIndexService;

  constructor(indexService: WorkspaceIndexService) {
    this.indexService = indexService;
  }

  getTreeItem(element: ExtensionTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ExtensionTreeItem): Promise<ExtensionTreeItem[]> {
    if (!element) {
      // Root level - show project modules
      const modules = this.indexService.getProjectModules();
      return modules.map((mod) => new ExtensionTreeItem(
        mod.module,
        vscode.TreeItemCollapsibleState.Expanded
      ));
    }

    // For now, return empty for child items
    return [];
  }

  getParent(_element: ExtensionTreeItem): vscode.ProviderResult<ExtensionTreeItem> {
    return undefined;
  }
}

export class ExtensionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: ExtensionTreeItem[]
  ) {
    super(label, collapsibleState);
    this.contextValue = 'extensionItem';
  }
}