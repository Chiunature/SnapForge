"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 只暴露最小 IPC 能力，避免在 renderer 中直接访问 Node/Electron API
electron_1.contextBridge.exposeInMainWorld('api', {
    ping: () => electron_1.ipcRenderer.invoke('ping'),
});
