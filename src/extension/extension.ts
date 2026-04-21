import * as vscode from 'vscode';

import { ArxmlCustomEditorProvider } from './editor/arxmlCustomEditorProvider';
import { createDefaultParser } from './services/parser/parserFactory';
import { WorkspaceScanner } from './services/workspace/workspaceScanner';
import { WorkspaceIndexService } from './services/index/workspaceIndexService';
import { ExtensionViewProvider } from './views/extensionViewProvider';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('[AUTOSAR] Extension activating...');
  console.log('[AUTOSAR] Extension path:', context.extensionUri.fsPath);

  const parser = createDefaultParser();
  const indexService = WorkspaceIndexService.getInstance(parser);
  const scanner = new WorkspaceScanner(indexService);

  context.subscriptions.push(indexService);
  context.subscriptions.push(scanner);

  await scanner.initialize();
  console.log('[AUTOSAR] Scanner initialized');

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      ArxmlCustomEditorProvider.viewType,
      new ArxmlCustomEditorProvider(context, indexService),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: true,
      }
    )
  );
  console.log('[AUTOSAR] Custom editor provider registered');

  // Register extension view in activity bar
  const extensionViewProvider = new ExtensionViewProvider(indexService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'autosarExplorerTree',
      extensionViewProvider
    )
  );
  console.log('[AUTOSAR] Extension view provider registered');

  context.subscriptions.push(
    vscode.commands.registerCommand('autosarArxml.rebuildIndex', async () => {
      await indexService.rebuildAll();
      vscode.window.showInformationMessage('AUTOSAR ARXML index rebuilt.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autosarArxml.openPreview', async (uri?: vscode.Uri) => {
      const target = uri ?? vscode.window.activeTextEditor?.document.uri;
      if (!target) {
        vscode.window.showWarningMessage('Open an ARXML file first.');
        return;
      }

      await vscode.commands.executeCommand('vscode.openWith', target, ArxmlCustomEditorProvider.viewType);
    })
  );
}

export function deactivate(): void {}

