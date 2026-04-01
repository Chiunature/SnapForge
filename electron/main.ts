import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

ipcMain.handle("ping", async () => {
	return "pong";
});
let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
//创建闪屏窗口
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

	// 加载闪屏页面（你可以自己做动画）
	splashWindow.loadFile(path.join(__dirname, "..", "src", "splash.html"));
	splashWindow.center(); // 居中

	// 闪屏关闭后清空引用
	splashWindow.on("closed", () => {
		splashWindow = null;
	});
}
//创建主窗口
async function createWindow() {
	const preloadPath = path.join(__dirname, "preload.js");
	const indexPath = path.join(__dirname, "..", "renderer", "dist", "index.html");

	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false, //先不显示
		webPreferences: {
			preload: preloadPath,
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	// 先绑定事件，再 load；否则 did-finish-load 可能已触发导致永远不 show/不关 splash
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

	const devUrl = process.env.VITE_DEV_SERVER_URL;
	if (devUrl) {
		await mainWindow.loadURL(devUrl);
		mainWindow.webContents.openDevTools({ mode: "detach" });
	} else {
		await mainWindow.loadFile(indexPath);
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	createSplashWindow(); // 先启动闪屏
	void createWindow(); // 再创建主窗口
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		void createWindow();
	}
});
