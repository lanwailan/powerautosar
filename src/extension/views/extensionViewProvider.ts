import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceIndexService } from '../services/index/workspaceIndexService';

export class ExtensionViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'autosar-arxml-tree';

  private readonly indexService: WorkspaceIndexService;

  constructor(indexService: WorkspaceIndexService) {
    this.indexService = indexService;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      this.handleMessage(message, webviewView);
    });
  }

  private handleMessage(message: { type: string; payload?: unknown }, webviewView: vscode.WebviewView): void {
    switch (message.type) {
      case 'GET_PROJECT_MODULES':
        const modules = this.indexService.getProjectModules();
        webviewView.webview.postMessage({ type: 'PROJECT_MODULES', payload: modules });
        break;
      case 'REBUILD_INDEX':
        this.indexService.rebuildAll().then(() => {
          const modules = this.indexService.getProjectModules();
          webviewView.webview.postMessage({ type: 'PROJECT_MODULES', payload: modules });
        });
        break;
      case 'OPEN_FILE':
        if (message.payload && typeof message.payload === 'object' && 'fileUri' in (message.payload as Record<string, unknown>)) {
          const uri = vscode.Uri.parse((message.payload as { fileUri: string }).fileUri);
          vscode.commands.executeCommand('vscode.openWith', uri, 'autosarArxml.editor');
        }
        break;
    }
  }

  private getHtml(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #ccc;
      background: #1e1e1e;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid #3c3c3c;
    }
    .header-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
    }
    .header-actions {
      display: flex;
      gap: 4px;
    }
    .icon-btn {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      width: 24px;
      height: 24px;
    }
    .icon-btn:hover {
      background: #3c3c3c;
      color: #fff;
    }
    .tree-container {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .tree-node {
      display: flex;
      flex-direction: column;
    }
    .tree-item {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      cursor: pointer;
      gap: 6px;
      user-select: none;
    }
    .tree-item:hover {
      background: #2a2d2e;
    }
    .tree-item.selected {
      background: #094771;
    }
    .tree-item .chevron {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-size: 12px;
      transition: transform 0.15s;
      flex-shrink: 0;
    }
    .tree-item .chevron.expanded {
      transform: rotate(90deg);
    }
    .tree-item .chevron.hidden {
      visibility: hidden;
    }
    .tree-item .icon {
      font-size: 14px;
      flex-shrink: 0;
    }
    .tree-item .label {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .tree-item .count {
      font-size: 11px;
      color: #666;
    }
    .tree-children {
      padding-left: 20px;
      display: none;
    }
    .tree-children.expanded {
      display: block;
    }
    .status-bar {
      padding: 8px 12px;
      border-top: 1px solid #3c3c3c;
      font-size: 11px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4caf50;
    }
    .status-dot.syncing {
      background: #ff9800;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .sync-btn {
      background: none;
      border: 1px solid #3c3c3c;
      color: #888;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }
    .sync-btn:hover {
      background: #3c3c3c;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-title">AUTOSAR Explorer</span>
    <div class="header-actions">
      <button class="icon-btn" id="btn-settings" title="Settings">⚙</button>
    </div>
  </div>

  <div class="tree-container" id="tree-container">
    <div class="tree-node">
      <div class="tree-item" id="project-modules-item">
        <span class="chevron expanded">▶</span>
        <span class="icon">📁</span>
        <span class="label">Project Modules</span>
        <span class="count" id="module-count">(0)</span>
      </div>
      <div class="tree-children expanded" id="module-children"></div>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-indicator">
      <div class="status-dot" id="status-dot"></div>
      <span id="status-text">Ready</span>
    </div>
    <button class="sync-btn" id="btn-sync">Project Scan</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    const state = {
      modules: [],
      expandedItems: new Set(['project-modules']),
      selectedItem: null
    };

    function renderTree() {
      const container = document.getElementById('module-children');
      const countEl = document.getElementById('module-count');
      countEl.textContent = '(' + state.modules.length + ')';

      container.innerHTML = state.modules.map((mod, index) => {
        const itemId = 'module-' + index;
        const isExpanded = state.expandedItems.has(itemId);
        const hasChildren = mod.files && mod.files.length > 0;

        let childrenHtml = '';
        if (hasChildren && isExpanded) {
          childrenHtml = '<div class="tree-children expanded">' +
            mod.files.map(file => \`<div class="tree-node">
              <div class="tree-item" data-file="\${file}">
                <span class="chevron hidden">▶</span>
                <span class="icon">📄</span>
                <span class="label">\${file.split('/').pop()}</span>
              </div>
            </div>\`).join('') +
            '</div>';
        }

        return \`<div class="tree-node">
          <div class="tree-item" data-module="\${mod.module}" data-item-id="\${itemId}">
            <span class="chevron \${hasChildren ? (isExpanded ? 'expanded' : '') : 'hidden'}">▶</span>
            <span class="icon">📂</span>
            <span class="label">\${mod.module}</span>
            <span class="count">\${mod.nodeCount}</span>
          </div>
          \${childrenHtml}
        </div>\`;
      }).join('');

      // Attach event listeners
      container.querySelectorAll('.tree-item[data-item-id]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemId = el.dataset.itemId;
          const module = el.dataset.module;

          if (state.expandedItems.has(itemId)) {
            state.expandedItems.delete(itemId);
          } else {
            state.expandedItems.add(itemId);
          }
          renderTree();
        });
      });

      container.querySelectorAll('.tree-item[data-file]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const fileUri = el.dataset.file;
          vscode.postMessage({ type: 'OPEN_FILE', payload: { fileUri } });
        });
      });
    }

    function setStatus(text, syncing = false) {
      document.getElementById('status-text').textContent = text;
      const dot = document.getElementById('status-dot');
      dot.classList.toggle('syncing', syncing);
    }

    document.getElementById('btn-sync').addEventListener('click', () => {
      setStatus('Scanning...', true);
      vscode.postMessage({ type: 'REBUILD_INDEX' });
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      console.log('Settings clicked');
    });

    document.getElementById('project-modules-item').addEventListener('click', () => {
      const itemId = 'project-modules';
      if (state.expandedItems.has(itemId)) {
        state.expandedItems.delete(itemId);
      } else {
        state.expandedItems.add(itemId);
      }
      const chevron = document.querySelector('#project-modules-item .chevron');
      chevron.classList.toggle('expanded');
      const children = document.getElementById('module-children');
      children.classList.toggle('expanded');
    });

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'PROJECT_MODULES':
          state.modules = message.payload;
          renderTree();
          setStatus('Ready');
          break;
      }
    });

    vscode.postMessage({ type: 'GET_PROJECT_MODULES' });
  </script>
</body>
</html>`;
  }
}