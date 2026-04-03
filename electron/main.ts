import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

ipcMain.handle("ping", async () => {
	return "pong";
});

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

/** 主进程编译在 electron-dist/，静态资源在项目根，不能依赖 app.getAppPath()（开发时往往等于 electron-dist） */
const projectRoot = path.join(__dirname, "..");

function getSplashHtmlPath() {
	return path.join(projectRoot, "src", "splash.html");
}

function getRendererIndexPath() {
	return path.join(projectRoot, "renderer", "dist", "index.html");
}

function getDevServerUrl() {
	return process.env.VITE_DEV_SERVER_URL;
}

function createSplashWindow() {
	splashWindow = new BrowserWindow({
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
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	let didFinish = false;
	const fallbackTimer = setTimeout(() => {
		if (didFinish) return;
		if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
		if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
	}, 5000);

	mainWindow.webContents.once("did-finish-load", () => {
		didFinish = true;
		clearTimeout(fallbackTimer);
		setTimeout(() => {
			if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
			if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
		}, 2000);
	});

	const devUrl = getDevServerUrl();
	if (devUrl) {
		await mainWindow.loadURL(devUrl);
		mainWindow.webContents.openDevTools({ mode: "detach" });
	} else {
		await mainWindow.loadFile(getRendererIndexPath());
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	createSplashWindow();
	void createWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createSplashWindow();
		void createWindow();
	}
});
