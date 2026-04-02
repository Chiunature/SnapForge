import { useEffect, useState } from "react";
import { getHostPingStatus } from "./api";

export function useHostPing() {
	const [pingText, setPingText] = useState("等待连接主进程...");

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const res = await getHostPingStatus();
				if (!cancelled) {
					setPingText(res.text);
				}
			} catch (error) {
				if (!cancelled) {
					setPingText(`IPC 异常: ${String(error)}`);
				}
				console.error(error);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return pingText;
}
