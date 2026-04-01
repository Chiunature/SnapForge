export {}

declare global {
  interface Window {
    /** 由 Electron preload 注入；纯浏览器打开 Vite 时不存在 */
    api?: {
      ping: () => Promise<string>
    }
  }
}

