export interface HostPingResult {
	connected: boolean;
	text: string;
}

export async function getHostPingStatus(): Promise<HostPingResult> {
	const bridge = window.api;

	if (bridge?.ping) {
		const result = await bridge.ping();
		return {
			connected: true,
			text: `已连接 · ping => ${result}`,
		};
	}

	if (import.meta.env.DEV) {
		console.warn("[SnapForge] 未检测到 window.api（若需真 IPC 请用 Electron 窗口打开本页，勿仅在浏览器访问 localhost:5173）");
		return {
			connected: false,
			text: "开发模式 · 当前未连接 Electron IPC",
		};
	}

	throw new Error("Electron 未注入 window.api");
}
