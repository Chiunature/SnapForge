const STORAGE_PREFIX = "snapforge.blocks.";

const getKey = (projectId: string) => `${STORAGE_PREFIX}${projectId}`;

export function saveProjectBlocks(projectId: string, xmlText: string) {
	try {
		localStorage.setItem(getKey(projectId), xmlText);
	} catch {
		// ignore quota / disabled storage errors
	}
}

export function loadProjectBlocks(projectId: string): string | null {
	try {
		return localStorage.getItem(getKey(projectId));
	} catch {
		return null;
	}
}

export function clearProjectBlocks(projectId: string) {
	try {
		localStorage.removeItem(getKey(projectId));
	} catch {
		// ignore
	}
}

