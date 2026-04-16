import { useEffect, useCallback, useRef } from 'react';
import type { ExtensionEvent, WebviewRequest } from '../types';
import { useEditorStore } from '../store/editorStore';

declare global {
  interface Window {
    acquireVsCodeApi: () => { postMessage: (msg: unknown) => void; getState: () => unknown; setState: (state: unknown) => void };
  }
}

// Module-level singleton to ensure acquireVsCodeApi is only called once
let vscodeApiInstance: ReturnType<typeof window.acquireVsCodeApi> | null = null;

const getVscodeApi = () => {
  if (!vscodeApiInstance) {
    vscodeApiInstance = window.acquireVsCodeApi?.();
  }
  return vscodeApiInstance;
};

export function useVscode() {
  const vscodeApiRef = useRef(getVscodeApi());
  const vscodeApi = vscodeApiRef.current;

  const postMessage = useCallback((message: WebviewRequest) => {
    vscodeApi?.postMessage(message);
  }, [vscodeApi]);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionEvent>) => {
      const message = event.data;

      switch (message.type) {
        case 'INIT_DATA':
          useEditorStore.getState().initFromPayload(message.payload);
          break;
        case 'CURRENT_FILE_TREE':
          useEditorStore.getState().setCurrentFileTree(message.payload);
          break;
        case 'PROJECT_VIEW':
          useEditorStore.getState().setProjectModules(message.payload);
          break;
        case 'NODE_DETAIL':
          useEditorStore.getState().setSelectedNodeDetail(message.payload);
          break;
        case 'GRAPH_DATA':
          useEditorStore.getState().setGraphData(message.payload);
          break;
        case 'DIAGNOSTICS':
          useEditorStore.getState().setDiagnostics(message.payload);
          break;
        case 'INDEX_STATUS':
          useEditorStore.getState().setIndexStatus(message.payload.status);
          break;
        case 'ERROR':
          useEditorStore.getState().setError(message.payload.message);
          break;
        case 'RAW_XML_CONTENT':
          useEditorStore.getState().setRawXmlContent(message.payload.xmlContent);
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const sendReady = useCallback(
    (fileUri: string) => {
      if (vscodeApi) {
        vscodeApi.postMessage({ type: 'READY', fileUri });
      }
    },
    [vscodeApi]
  );

  const selectNode = useCallback(
    (nodeId: string) => {
      useEditorStore.getState().selectNode(nodeId);
      postMessage({ type: 'SELECT_NODE', nodeId });
    },
    [postMessage]
  );

  const jumpToReference = useCallback(
    (targetNodeId: string) => {
      postMessage({ type: 'JUMP_TO_REFERENCE', targetNodeId });
    },
    [postMessage]
  );

  const openRawXml = useCallback(
    (nodeId: string) => {
      postMessage({ type: 'OPEN_RAW_XML', nodeId });
    },
    [postMessage]
  );

  const getCurrentFileTree = useCallback(
    (fileUri: string) => {
      postMessage({ type: 'GET_CURRENT_FILE_TREE', fileUri });
    },
    [postMessage]
  );

  const getProjectView = useCallback(() => {
    postMessage({ type: 'GET_PROJECT_VIEW' });
  }, [postMessage]);

  const getGraph = useCallback(
    (nodeId: string, depth: number = 1) => {
      postMessage({ type: 'GET_GRAPH', nodeId, depth });
    },
    [postMessage]
  );

  return {
    sendReady,
    selectNode,
    jumpToReference,
    openRawXml,
    getCurrentFileTree,
    getProjectView,
    getGraph,
  };
}
