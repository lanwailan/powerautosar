import * as vscode from 'vscode';

import { ExtensionEvent, WebviewRequest } from '../protocol/messages';

export type WebviewRequestHandler = (
  message: WebviewRequest,
  panel: vscode.WebviewPanel
) => Promise<void> | void;

export class WebviewMessageRouter {
  constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly handler: WebviewRequestHandler
  ) {}

  attach(): vscode.Disposable {
    return this.panel.webview.onDidReceiveMessage(async (message: WebviewRequest) => {
      console.log('[AUTOSAR] Router.onDidReceiveMessage:', message.type);
      await this.handler(message, this.panel);
    });
  }

  postMessage(message: ExtensionEvent): Thenable<boolean> {
    console.log('[AUTOSAR] Router.postMessage called with type:', message.type);
    const result = this.panel.webview.postMessage(message);
    console.log('[AUTOSAR] Router.postMessage result:', result);
    return result;
  }
}
