import { Navigate, Route, Routes } from "react-router-dom";
import { useHostPing } from "../host/useHostPing";
import { ProjectEditorPage } from "../pages/ProjectEditorPage";
import { ProjectListPage } from "../pages/ProjectListPage";

export default function AppRouter() {
	const pingText = useHostPing();

	return (
		<Routes>
			<Route path="/" element={<ProjectListPage pingText={pingText} />} />
			<Route path="/project/:id" element={<ProjectEditorPage pingText={pingText} />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
