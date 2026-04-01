export async function ping(): Promise<string> {
	// window.api.ping 由 `electron/preload.ts` 暴露（contextBridge）
	return window.api.ping();
}
