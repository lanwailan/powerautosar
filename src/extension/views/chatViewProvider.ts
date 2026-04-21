import * as vscode from 'vscode';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'autosar-arxml-chat';

  constructor() {}

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

  private handleMessage(message: { type: string; payload?: unknown }, _webviewView: vscode.WebviewView): void {
    switch (message.type) {
      case 'SEND_MESSAGE':
        // Placeholder for AI chat functionality
        console.log('[CHAT] Received message:', message.payload);
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
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
    }
    .message.user {
      background: #0078d4;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .message.assistant {
      background: #2d2d2d;
      color: #ccc;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .welcome {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }
    .welcome h3 {
      color: #888;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .welcome p {
      font-size: 12px;
      line-height: 1.6;
    }
    .input-area {
      padding: 12px;
      border-top: 1px solid #3c3c3c;
      display: flex;
      gap: 8px;
    }
    .input-field {
      flex: 1;
      background: #2d2d2d;
      border: 1px solid #3c3c3c;
      border-radius: 8px;
      padding: 10px 14px;
      color: #ccc;
      font-size: 13px;
      resize: none;
      outline: none;
    }
    .input-field:focus {
      border-color: #0078d4;
    }
    .input-field::placeholder {
      color: #666;
    }
    .send-btn {
      background: #0078d4;
      border: none;
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .send-btn:hover {
      background: #006cbd;
    }
    .send-btn:disabled {
      background: #3c3c3c;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-title">AI Assistant</span>
  </div>

  <div class="chat-container" id="chat-container">
    <div class="welcome">
      <h3>AUTOSAR ARXML Assistant</h3>
      <p>Ask me anything about your ARXML files,<br>project structure, or AUTOSAR concepts.</p>
    </div>
  </div>

  <div class="input-area">
    <textarea
      class="input-field"
      id="message-input"
      rows="1"
      placeholder="Ask about AUTOSAR..."
    ></textarea>
    <button class="send-btn" id="send-btn">Send</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    function addMessage(content, type) {
      const msg = document.createElement('div');
      msg.className = 'message ' + type;
      msg.textContent = content;
      chatContainer.appendChild(msg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function handleSend() {
      const text = messageInput.value.trim();
      if (!text) return;

      addMessage(text, 'user');
      messageInput.value = '';

      vscode.postMessage({ type: 'SEND_MESSAGE', payload: text });

      // Placeholder response
      setTimeout(() => {
        addMessage('This is a placeholder response. AI chat functionality coming soon.', 'assistant');
      }, 500);
    }

    sendBtn.addEventListener('click', handleSend);
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  </script>
</body>
</html>`;
  }
}