import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BlocklyWorkspace } from "../features/blockly/BlocklyWorkspace";
import { getProjectById } from "../features/projects/repository";

interface ProjectEditorPageProps {
	pingText: string;
}

export function ProjectEditorPage({ pingText }: ProjectEditorPageProps) {
	const navigate = useNavigate();
	const { id } = useParams();
	const projectId = id ?? "";
	const project = getProjectById(projectId);

	if (!project) {
		return <Navigate to="/" replace />;
	}

	return (
		<div className="editor-page">
			<header className="editor-page-header">
				<button className="editor-back-btn" onClick={() => navigate("/")}>
					← 返回作品列表
				</button>
				<div className="editor-title-group">
					<div className="editor-title">正在编辑：{project.title}</div>
					<div className="app-status-bar editor-status-inline">{pingText}</div>
				</div>
			</header>

			<div className="editor-page-content">
				<BlocklyWorkspace projectId={project.id} />
			</div>
		</div>
	);
}
