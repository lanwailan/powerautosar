/// <reference types="vite/client" />

interface Window {
  vscode: {
    postMessage: (message: unknown) => void;
    getState?: () => unknown;
    setState?: (state: unknown) => void;
  };
}
