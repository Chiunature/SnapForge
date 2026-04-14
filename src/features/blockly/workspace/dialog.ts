import * as Blockly from "blockly";

let dialogReady = false;

export function setupBlocklyDialog() {
	if (dialogReady) {
		return;
	}

	const dialogApi = (Blockly as any).dialog;
	if (dialogApi && typeof dialogApi.setPrompt === "function") {
		dialogApi.setPrompt(
			(_message: string, defaultValue: string, callback: (newValue: string | null) => void) => {
				const name = defaultValue || `变量_${Date.now().toString(16).slice(-4)}`;
				callback(name);
			},
		);
	}

	dialogReady = true;
}
