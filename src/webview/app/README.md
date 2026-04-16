# AUTOSAR ARXML Webview

React-based webview for the AUTOSAR ARXML Explorer VSCode extension.

## Structure

```
src/webview/app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── types.ts
    ├── store/
    │   └── editorStore.ts
    ├── hooks/
    │   └── useVscode.ts
    └── components/
        ├── AppShell.tsx
        ├── SidebarTabs.tsx
        ├── CurrentFileTree.tsx
        ├── ProjectModuleView.tsx
        ├── BreadcrumbBar.tsx
        ├── NodeDetailPanel.tsx
        ├── MiniGraph.tsx
        └── StatusBar.tsx
```

## Development

```bash
cd src/webview/app
npm install
npm run dev
```

## Build

The webview is built using Vite with singlefile plugin for VSCode webview compatibility.
