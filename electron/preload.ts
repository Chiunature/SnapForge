import { contextBridge, ipcRenderer } from 'electron'

// 只暴露最小 IPC 能力，避免在 renderer 中直接访问 Node/Electron API
contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
})
