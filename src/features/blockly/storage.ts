const STORAGE_PREFIX = "snapforge.blocks.";

function getStorageKey(projectId: string) {
	return `${STORAGE_PREFIX}${projectId}`;
}

export function saveProjectBlocks(projectId: string, xmlText: string) {
	try {
		localStorage.setItem(getStorageKey(projectId), xmlText);
	} catch {
		// ignore storage failures
	}
}

export function loadProjectBlocks(projectId: string) {
	try {
		return localStorage.getItem(getStorageKey(projectId));
	} catch {
		return null;
	}
}

export function clearProjectBlocks(projectId: string) {
	try {
		localStorage.removeItem(getStorageKey(projectId));
	} catch {
		// ignore
	}
}
