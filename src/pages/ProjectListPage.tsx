import { useNavigate } from "react-router-dom";
import { listProjects } from "../features/projects/repository";

interface ProjectListPageProps {
	pingText: string;
}

export function ProjectListPage({ pingText }: ProjectListPageProps) {
	const navigate = useNavigate();
	const projects = listProjects();

	return (
		<div className="app-root">
			<aside className="app-sidebar">
				<div className="app-logo">SnapForge</div>
				<div className="app-nav-section">
					<div className="app-nav-item active">
						<div className="app-nav-icon">📁</div>
						<span>我的作品</span>
					</div>
				</div>
			</aside>

			<main className="app-main">
				<header className="app-main-header">
					<div className="app-main-title">我的作品</div>
					<div className="app-toolbar">
						<div className="app-tabs">
							<div className="app-tab active">本地作品</div>
							<div className="app-tab">导入作品</div>
						</div>
						<input className="app-search-input" placeholder="搜索" />
					</div>
				</header>

				<section className="app-content">
					<div className="app-card-grid">
						<div className="app-card-new">+ 新建作品</div>
						{projects.map((project) => (
							<div
								key={project.id}
								className="app-card app-card-clickable"
								onClick={() => navigate(`/project/${project.id}`)}
							>
								<div className="app-card-title">{project.title}</div>
								<div className="app-card-meta">
									<span>{project.createdAt}</span>
									<span className="app-tag">{project.tag}</span>
								</div>
							</div>
						))}
					</div>
				</section>

				<div className="app-status-bar">{pingText}</div>
			</main>
		</div>
	);
}
