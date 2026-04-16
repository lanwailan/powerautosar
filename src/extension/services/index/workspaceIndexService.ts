import * as vscode from 'vscode';

import { ParseDiagnostic } from '../../models/diagnostics';
import { ArxmlModule, NormalizedArxmlNode } from '../../models/normalizedNode';
import { ArxmlReference } from '../../models/reference';
import { WorkspaceIndexStatus, WorkspaceIndexState } from '../../models/workspaceState';
import { IParser } from '../parser/parser';

export interface WorkspaceIndex {
  nodesById: Map<string, NormalizedArxmlNode>;
  nodesByFile: Map<string, string[]>;
  nodesByModule: Map<ArxmlModule, string[]>;
  nodesByType: Map<string, string[]>;
  nodesByShortName: Map<string, string[]>;
  nodesBySemanticPath: Map<string, string>;
  nodesByArPath: Map<string, string[]>;
  referencesById: Map<string, ArxmlReference>;
  referencesBySource: Map<string, string[]>;
  referencesByTarget: Map<string, string[]>;
  diagnosticsByFile: Map<string, ParseDiagnostic[]>;
}

export interface WorkspaceIndexChangeEvent {
  kind: 'full-rebuild' | 'file-updated' | 'file-removed' | 'diagnostics-updated';
  fileUri?: string;
  affectedNodeIds?: string[];
}

function createEmptyIndex(): WorkspaceIndex {
  return {
    nodesById: new Map(),
    nodesByFile: new Map(),
    nodesByModule: new Map(),
    nodesByType: new Map(),
    nodesByShortName: new Map(),
    nodesBySemanticPath: new Map(),
    nodesByArPath: new Map(),
    referencesById: new Map(),
    referencesBySource: new Map(),
    referencesByTarget: new Map(),
    diagnosticsByFile: new Map(),
  };
}

export class WorkspaceIndexService implements vscode.Disposable {
  private static instance: WorkspaceIndexService | undefined;

  static getInstance(parser: IParser): WorkspaceIndexService {
    if (!WorkspaceIndexService.instance) {
      WorkspaceIndexService.instance = new WorkspaceIndexService(parser);
    }

    return WorkspaceIndexService.instance;
  }

  private readonly onDidChangeIndexEmitter = new vscode.EventEmitter<WorkspaceIndexChangeEvent>();
  private readonly statusEmitter = new vscode.EventEmitter<WorkspaceIndexState>();
  private index: WorkspaceIndex = createEmptyIndex();
  private workspaceFolders: readonly vscode.WorkspaceFolder[] = [];
  private state: WorkspaceIndexState = { status: 'idle' };

  private constructor(private readonly parser: IParser) {}

  get onDidChangeIndex(): vscode.Event<WorkspaceIndexChangeEvent> {
    return this.onDidChangeIndexEmitter.event;
  }

  get onDidChangeStatus(): vscode.Event<WorkspaceIndexState> {
    return this.statusEmitter.event;
  }

  getState(): WorkspaceIndexState {
    return this.state;
  }

  async initialize(workspaceFolders: readonly vscode.WorkspaceFolder[]): Promise<void> {
    this.workspaceFolders = workspaceFolders;
  }

  async rebuildAll(): Promise<void> {
    this.setStatus('scanning');

    const files = await vscode.workspace.findFiles('**/*.arxml');
    this.index = createEmptyIndex();

    for (const file of files) {
      await this.updateFile(file);
    }

    this.resolveReferences();
    this.setStatus('ready');
    this.onDidChangeIndexEmitter.fire({ kind: 'full-rebuild' });
  }

  async updateFile(fileUri: vscode.Uri | string): Promise<void> {
    const normalizedUri = typeof fileUri === 'string' ? vscode.Uri.parse(fileUri) : fileUri;
    this.setStatus('parsing');

    const content = Buffer.from(await vscode.workspace.fs.readFile(normalizedUri)).toString('utf8');
    const result = await this.parser.parseFile(normalizedUri.toString(), content);

    this.removeFileEntries(normalizedUri.toString());

    const nodeIds: string[] = [];
    for (const node of result.nodes) {
      this.index.nodesById.set(node.id, node);
      nodeIds.push(node.id);
      this.pushIndex(this.index.nodesByModule, node.module, node.id);
      this.pushIndex(this.index.nodesByType, node.type, node.id);
      if (node.shortName) {
        this.pushIndex(this.index.nodesByShortName, node.shortName, node.id);
      }
      this.index.nodesBySemanticPath.set(node.semanticPath, node.id);
    }

    this.index.nodesByFile.set(normalizedUri.toString(), nodeIds);
    this.index.diagnosticsByFile.set(normalizedUri.toString(), result.diagnostics);

    for (const reference of result.references) {
      this.index.referencesById.set(reference.id, reference);
      this.pushIndex(this.index.referencesBySource, reference.sourceNodeId, reference.id);
      if (reference.arPath) {
        this.pushIndex(this.index.nodesByArPath, reference.arPath, reference.sourceNodeId);
      }
    }

    this.resolveReferences();
    this.setStatus('ready');
    this.onDidChangeIndexEmitter.fire({
      kind: 'file-updated',
      fileUri: normalizedUri.toString(),
      affectedNodeIds: nodeIds,
    });
  }

  async removeFile(fileUri: string): Promise<void> {
    this.removeFileEntries(fileUri);
    this.onDidChangeIndexEmitter.fire({ kind: 'file-removed', fileUri });
  }

  getNode(nodeId: string): NormalizedArxmlNode | undefined {
    return this.index.nodesById.get(nodeId);
  }

  getNodesByFile(fileUri: string): NormalizedArxmlNode[] {
    return (this.index.nodesByFile.get(fileUri) ?? [])
      .map((id) => this.index.nodesById.get(id))
      .filter((node): node is NormalizedArxmlNode => Boolean(node));
  }

  getNodesByModule(module: ArxmlModule): NormalizedArxmlNode[] {
    return (this.index.nodesByModule.get(module) ?? [])
      .map((id) => this.index.nodesById.get(id))
      .filter((node): node is NormalizedArxmlNode => Boolean(node));
  }

  getProjectModules(): Array<{ module: string; nodeCount: number }> {
    return [...this.index.nodesByModule.entries()].map(([module, ids]) => ({
      module,
      nodeCount: ids.length,
    }));
  }

  getOutgoingReferences(nodeId: string): ArxmlReference[] {
    return (this.index.referencesBySource.get(nodeId) ?? [])
      .map((id) => this.index.referencesById.get(id))
      .filter((ref): ref is ArxmlReference => Boolean(ref));
  }

  getIncomingReferences(nodeId: string): ArxmlReference[] {
    return (this.index.referencesByTarget.get(nodeId) ?? [])
      .map((id) => this.index.referencesById.get(id))
      .filter((ref): ref is ArxmlReference => Boolean(ref));
  }

  getDiagnostics(fileUri: string): ParseDiagnostic[] {
    return this.index.diagnosticsByFile.get(fileUri) ?? [];
  }

  dispose(): void {
    this.onDidChangeIndexEmitter.dispose();
    this.statusEmitter.dispose();
  }

  private setStatus(status: WorkspaceIndexStatus, message?: string): void {
    this.state = {
      status,
      message,
      lastUpdatedAt: Date.now(),
    };
    this.statusEmitter.fire(this.state);
  }

  private pushIndex(map: Map<string, string[]>, key: string, value: string): void {
    const existing = map.get(key);
    if (existing) {
      existing.push(value);
      return;
    }
    map.set(key, [value]);
  }

  private removeFileEntries(fileUri: string): void {
    const nodeIds = this.index.nodesByFile.get(fileUri) ?? [];

    for (const nodeId of nodeIds) {
      const node = this.index.nodesById.get(nodeId);
      if (!node) {
        continue;
      }

      this.index.nodesById.delete(nodeId);
      this.index.nodesBySemanticPath.delete(node.semanticPath);
    }

    this.index.nodesByFile.delete(fileUri);
    this.index.diagnosticsByFile.delete(fileUri);
  }

  private resolveReferences(): void {
    this.index.referencesByTarget.clear();

    for (const reference of this.index.referencesById.values()) {
      const resolvedTargetId = this.resolveReferenceTarget(reference);
      reference.targetNodeId = resolvedTargetId;
      reference.resolved = Boolean(resolvedTargetId);
      if (resolvedTargetId) {
        this.pushIndex(this.index.referencesByTarget, resolvedTargetId, reference.id);
      }
    }
  }

  private resolveReferenceTarget(reference: ArxmlReference): string | undefined {
    if (reference.arPath) {
      const direct = this.index.nodesBySemanticPath.get(reference.arPath);
      if (direct) {
        return direct;
      }

      const lastSegment = reference.arPath.split('/').filter(Boolean).at(-1);
      if (lastSegment) {
        return this.index.nodesByShortName.get(lastSegment)?.[0];
      }
    }

    return this.index.nodesByShortName.get(reference.targetRef)?.[0];
  }
}
