export async function ping(): Promise<string> {
	// `window.api` 由 `electron/preload.ts` 暴露；纯浏览器打开 Vite 开发地址时没有 preload
	const bridge = window.api;
	if (bridge?.ping) {
		return bridge.ping();
	}
	if (import.meta.env.DEV) {
		console.warn("[SnapForge] 未检测到 window.api（若需真 IPC 请用 Electron 窗口打开本页，勿仅在浏览器访问 localhost:5173）");
		return "pong（开发占位·无 IPC）";
	}
	throw new Error("Electron 未注入 window.api");
}
