"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
electron_1.ipcMain.handle("ping", async () => {
    return "pong";
});
let splashWindow = null;
let mainWindow = null;
/** 主进程编译在 electron-dist/，静态资源在项目根，不能依赖 app.getAppPath()（开发时往往等于 electron-dist） */
const projectRoot = node_path_1.default.join(__dirname, "..");
function getSplashHtmlPath() {
    return node_path_1.default.join(projectRoot, "src", "splash.html");
}
function getRendererIndexPath() {
    return node_path_1.default.join(projectRoot, "renderer", "dist", "index.html");
}
function getDevServerUrl() {
    return process.env.VITE_DEV_SERVER_URL;
}
function createSplashWindow() {
    splashWindow = new electron_1.BrowserWindow({
        width: 400,
        height: 300,
        frame: false, // 无边框
        transparent: true, // 透明背景（支持动画）
        alwaysOnTop: true, // 永远置顶
        skipTaskbar: true, // 不显示在任务栏
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    void splashWindow.loadFile(getSplashHtmlPath());
    splashWindow.center();
    splashWindow.on("closed", () => {
        splashWindow = null;
    });
}
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1100,
        height: 800,
        show: false,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    let didFinish = false;
    const fallbackTimer = setTimeout(() => {
        if (didFinish)
            return;
        if (mainWindow && !mainWindow.isDestroyed())
            mainWindow.show();
        if (splashWindow && !splashWindow.isDestroyed())
            splashWindow.close();
    }, 5000);
    mainWindow.webContents.once("did-finish-load", () => {
        didFinish = true;
        clearTimeout(fallbackTimer);
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed())
                mainWindow.show();
            if (splashWindow && !splashWindow.isDestroyed())
                splashWindow.close();
        }, 2000);
    });
    const devUrl = getDevServerUrl();
    if (devUrl) {
        await mainWindow.loadURL(devUrl);
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }
    else {
        await mainWindow.loadFile(getRendererIndexPath());
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createSplashWindow();
    void createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createSplashWindow();
        void createWindow();
    }
});
