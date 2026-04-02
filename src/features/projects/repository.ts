import { mockProjects } from "./mockProjects";

export function listProjects() {
	return mockProjects;
}

export function getProjectById(projectId: string) {
	return mockProjects.find((project) => project.id === projectId) ?? null;
}
