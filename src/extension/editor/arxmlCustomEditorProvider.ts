import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { BreadcrumbItem, EditorInitDto, GraphDto, NodeDetailDto, TreeNodeDto } from '../protocol/dto';
import { ExtensionEvent, WebviewRequest } from '../protocol/messages';
import { NavigationService } from '../services/navigation/navigationService';
import { WorkspaceIndexService } from '../services/index/workspaceIndexService';
import { WebviewMessageRouter } from './webviewMessageRouter';

export class ArxmlCustomEditorProvider implements vscode.CustomReadonlyEditorProvider {
  static readonly viewType = 'autosarArxml.editor';

  private readonly navigationService: NavigationService;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly indexService: WorkspaceIndexService
  ) {
    this.navigationService = new NavigationService(indexService);
  }

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return {
      uri,
      dispose: () => {},
    };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    console.log('[AUTOSAR] resolveCustomEditor called');

    webviewPanel.webview.options = {
      enableScripts: true,
    };

    const html = await this.getHtml(webviewPanel.webview, document.uri);
    webviewPanel.webview.html = html;

    const router = new WebviewMessageRouter(webviewPanel, async (message) => {
      console.log('[AUTOSAR] handleMessage:', message.type);
      await this.handleMessage(message, webviewPanel, document.uri);
    });

    const sub = router.attach();

    webviewPanel.onDidDispose(() => {
      sub.dispose();
    });

    // Don't send INIT_DATA here - wait for webview to send READY
  }

  private async handleMessage(
    message: WebviewRequest,
    panel: vscode.WebviewPanel,
    fileUri: vscode.Uri
  ): Promise<void> {
    const post = (event: ExtensionEvent) => panel.webview.postMessage(event);

    switch (message.type) {
      case 'READY':
        console.log('[AUTOSAR] handleMessage: READY received');
        await this.pushInitData(undefined, fileUri, panel); // Use panel for READY since router isn't set up yet
        break;
      case 'GET_CURRENT_FILE_TREE':
        await post({ type: 'CURRENT_FILE_TREE', payload: this.buildTree(fileUri.toString()) });
        break;
      case 'GET_PROJECT_VIEW':
        await post({ type: 'PROJECT_VIEW', payload: this.indexService.getProjectModules() });
        break;
      case 'SELECT_NODE': {
        const detail = this.buildNodeDetail(message.nodeId);
        if (detail) {
          await post({ type: 'NODE_DETAIL', payload: detail });
          await post({ type: 'GRAPH_DATA', payload: this.buildMiniGraph(message.nodeId) });
        }
        break;
      }
      case 'JUMP_TO_REFERENCE':
        await this.navigationService.jumpToNode(message.targetNodeId);
        break;
      case 'OPEN_RAW_XML': {
        const node = this.indexService.getNode(message.nodeId);
        if (node) {
          try {
            const uri = typeof node.fileUri === 'string' ? vscode.Uri.parse(node.fileUri) : node.fileUri;
            const document = await vscode.workspace.openTextDocument(uri);
            const xmlContent = document.getText();
            await post({ type: 'RAW_XML_CONTENT', payload: { nodeId: message.nodeId, xmlContent } });
          } catch (error) {
            await post({ type: 'ERROR', payload: { message: `Failed to read XML: ${error}` } });
          }
        }
        break;
      }
      case 'GET_GRAPH':
        await post({ type: 'GRAPH_DATA', payload: this.buildMiniGraph(message.nodeId) });
        break;
      default:
        await post({ type: 'ERROR', payload: { message: 'Unsupported message' } });
    }
  }

  private async pushInitData(
    router: WebviewMessageRouter | undefined,
    fileUri: vscode.Uri | undefined,
    panel?: vscode.WebviewPanel
  ): Promise<void> {
    const targetFile = fileUri;
    if (!targetFile) {
      return;
    }

    // If file is not indexed yet, index it on-demand
    let nodes = this.indexService.getNodesByFile(targetFile.toString());
    if (nodes.length === 0) {
      console.log('[AUTOSAR] pushInitData: file not indexed, indexing on-demand');
      await this.indexService.updateFile(targetFile);
      nodes = this.indexService.getNodesByFile(targetFile.toString());
    }

    const firstNode = nodes[0];
    const tree = this.buildTree(targetFile.toString());

    console.log('[AUTOSAR] pushInitData: file=', targetFile.toString());
    console.log('[AUTOSAR] pushInitData: nodes count=', nodes.length);
    console.log('[AUTOSAR] pushInitData: tree count=', tree.length);
    console.log('[AUTOSAR] pushInitData: firstNode=', firstNode?.id);

    const payload: EditorInitDto = {
      fileUri: targetFile.toString(),
      title: targetFile.path.split('/').pop() ?? 'ARXML',
      indexStatus: this.indexService.getState().status,
      currentFileTree: tree,
      projectModules: this.indexService.getProjectModules(),
      selectedNodeDetail: firstNode ? this.buildNodeDetail(firstNode.id) : undefined,
      diagnostics: this.indexService.getDiagnostics(targetFile.toString()),
      graph: firstNode ? this.buildMiniGraph(firstNode.id) : undefined,
      breadcrumb: firstNode ? this.buildBreadcrumb(firstNode.id) : [],
    };

    if (router) {
      console.log('[AUTOSAR] pushInitData: using router');
      router.postMessage({ type: 'INIT_DATA', payload });
    } else if (panel) {
      console.log('[AUTOSAR] pushInitData: using panel');
      panel.webview.postMessage({ type: 'INIT_DATA', payload });
    }
  }

  private buildTree(fileUri: string): TreeNodeDto[] {
    const nodes = this.indexService.getNodesByFile(fileUri);
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // Skip structural container types
    const skipTypes = new Set(['AR-PACKAGES', 'ELEMENTS', 'SUB-CONTAINERS', 'PARAMETER-VALUES', 'REFERENCE-VALUES', 'PHYSICAL-CHANNELS', 'FRAME-TRIGGERINGS', 'I-SIGNAL-TRIGGERINGS', 'PDU-TRIGGERINGS', 'CONTAINERS']);

    // Only show nodes that have a SHORT-NAME (meaningful content) - not skipTypes and displayName != type
    const isMeaningfulNode = (node: { type: string; displayName: string }) =>
      !skipTypes.has(node.type) && node.displayName !== node.type;

    // Build child map for all nodes
    const nodeChildren = new Map<string, string[]>();
    for (const node of nodes) {
      nodeChildren.set(node.id, node.childIds);
    }

    // For each node, find its meaningful children
    const getMeaningfulChildren = (nodeId: string): string[] => {
      const childIds = nodeChildren.get(nodeId) || [];
      const meaningful: string[] = [];
      for (const childId of childIds) {
        const child = nodeMap.get(childId);
        if (!child) continue;

        if (isMeaningfulNode(child)) {
          meaningful.push(childId);
        } else {
          // Recursively get meaningful children from this non-meaningful node
          meaningful.push(...getMeaningfulChildren(childId));
        }
      }
      return meaningful;
    };

    // Find root nodes (nodes whose parents are not meaningful or are roots)
    const rootIds = new Set<string>();
    const childOf = new Set<string>();
    for (const node of nodes) {
      for (const childId of node.childIds) {
        childOf.add(childId);
      }
    }
    for (const node of nodes) {
      if (!childOf.has(node.id)) {
        rootIds.add(node.id);
      }
    }

    // Build tree recursively
    const toTree = (nodeId: string): TreeNodeDto | undefined => {
      const node = nodeMap.get(nodeId);
      if (!node) return undefined;

      const meaningfulChildren = getMeaningfulChildren(nodeId);

      return {
        id: node.id,
        label: node.displayName,
        type: node.type,
        children: meaningfulChildren
          .map((childId) => toTree(childId))
          .filter((entry): entry is TreeNodeDto => Boolean(entry)),
      };
    };

    // Start from roots and collect all top-level meaningful nodes
    const result: TreeNodeDto[] = [];
    const visited = new Set<string>();

    const collectRoots = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return;

      if (isMeaningfulNode(node)) {
        result.push(toTree(nodeId)!);
      } else {
        const children = getMeaningfulChildren(nodeId);
        for (const childId of children) {
          collectRoots(childId);
        }
      }
    };

    for (const rootId of rootIds) {
      collectRoots(rootId);
    }

    return result;
  }

  private buildNodeDetail(nodeId: string): NodeDetailDto | undefined {
    const node = this.indexService.getNode(nodeId);
    if (!node) {
      return undefined;
    }

    // Get all nodes in the file to traverse
    const allNodes = this.indexService.getNodesByFile(node.fileUri);
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
    const properties: { key: string; value: string }[] = [];

    // Skip structural container types
    const skipTypes = new Set(['AR-PACKAGES', 'ELEMENTS', 'SUB-CONTAINERS', 'PARAMETER-VALUES', 'REFERENCE-VALUES', 'PHYSICAL-CHANNELS', 'FRAME-TRIGGERINGS', 'I-SIGNAL-TRIGGERINGS', 'PDU-TRIGGERINGS', 'CONTAINERS']);

    // Add the current node's attributes first
    for (const [key, val] of Object.entries(node.attributes)) {
      if (key.startsWith('@_')) {
        // Skip XML attributes like @_DEST, show them differently
        properties.push({ key: `@${key}`, value: String(val) });
      } else {
        properties.push({ key, value: JSON.stringify(val) });
      }
    }

    // Then recursively collect child node information (direct children only)
    const seenKeys = new Set(properties.map(p => p.key));

    const addChildren = (parentId: string, depth: number) => {
      if (depth > 3) return; // Limit depth

      const parent = nodeMap.get(parentId);
      if (!parent) return;

      for (const childId of parent.childIds) {
        const child = nodeMap.get(childId);
        if (!child) continue;

        if (skipTypes.has(child.type)) {
          addChildren(childId, depth + 1);
          continue;
        }

        // For each child, collect its key attributes
        let added = false;
        for (const [key, val] of Object.entries(child.attributes)) {
          if (key.startsWith('@_')) {
            // Show DEST type
            if (!seenKeys.has(`DEST:${val}`)) {
              properties.push({ key: `DEST`, value: String(val) });
              seenKeys.add(`DEST:${val}`);
              added = true;
            }
          } else if (key === '#text' || key === 'text') {
            // Show text content
            const textVal = String(val);
            if (textVal && textVal !== '{}' && !seenKeys.has(textVal)) {
              properties.push({ key: child.displayName, value: textVal });
              seenKeys.add(textVal);
              added = true;
            }
          }
        }

        // If no attributes were added but it's a meaningful node, add it with its type
        if (!added && child.displayName !== child.type) {
          properties.push({ key: child.displayName, value: child.type });
        }
      }
    };

    addChildren(nodeId, 0);

    return {
      id: node.id,
      displayName: node.displayName,
      type: node.type,
      module: node.module,
      semanticPath: node.semanticPath,
      fileUri: node.fileUri,
      properties,
      outgoingRelations: this.indexService.getOutgoingReferences(node.id).map((ref) => ({
        referenceId: ref.id,
        label: `${ref.sourceField} -> ${ref.targetRef}`,
        targetNodeId: ref.targetNodeId,
        resolved: ref.resolved,
      })),
      incomingRelations: this.indexService.getIncomingReferences(node.id).map((ref) => ({
        referenceId: ref.id,
        label: `${ref.sourceNodeId} -> ${ref.sourceField}`,
        targetNodeId: ref.sourceNodeId,
        resolved: ref.resolved,
      })),
    };
  }

  private buildMiniGraph(nodeId: string): GraphDto {
    const node = this.indexService.getNode(nodeId);
    if (!node) {
      return { nodes: [], edges: [] };
    }

    const outgoing = this.indexService.getOutgoingReferences(nodeId);
    const nodes = [
      {
        id: node.id,
        label: node.displayName,
        type: node.type,
        module: node.module,
      },
    ];

    const edges = outgoing.map((ref) => ({
      id: ref.id,
      source: node.id,
      target: ref.targetNodeId ?? ref.id,
      label: ref.sourceField,
    }));

    for (const ref of outgoing) {
      const targetNode = ref.targetNodeId ? this.indexService.getNode(ref.targetNodeId) : undefined;
      if (targetNode) {
        nodes.push({
          id: targetNode.id,
          label: targetNode.displayName,
          type: targetNode.type,
          module: targetNode.module,
        });
      }
    }

    return { nodes, edges };
  }

  private buildBreadcrumb(nodeId: string): BreadcrumbItem[] {
    const node = this.indexService.getNode(nodeId);
    if (!node) {
      return [];
    }

    return node.semanticPath
      .split('/')
      .filter(Boolean)
      .map((segment, index, all) => ({
        id: `${node.id}#crumb-${index}`,
        label: index === 0 ? `${node.fileUri.split('/').pop() ?? 'file'}` : all[index],
      }));
  }

  private async getHtml(webview: vscode.Webview, _fileUri: vscode.Uri): Promise<string> {
    const htmlPath = path.join(this.context.extensionUri.fsPath, 'dist-webview', 'index.html');

    try {
      let html = await fs.promises.readFile(htmlPath, 'utf-8');

      // Convert relative paths to webview URIs
      html = html.replace(/(src|href)=["']([^"']+)["']/g, (_match, attr, url) => {
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('vscode-webview://')) {
          return `${attr}="${url}"`;
        }

        const filePath = path.join(this.context.extensionUri.fsPath, 'dist-webview', url);
        const uri = webview.asWebviewUri(vscode.Uri.file(filePath));
        return `${attr}="${uri}"`;
      });

      return html;
    } catch (error) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Error</title>
</head>
<body>
  <h1>Failed to load webview</h1>
  <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
</body>
</html>`;
    }
  }
}
