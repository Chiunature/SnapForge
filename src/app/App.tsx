import { useEffect, useMemo, useState, type DragEvent } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ping } from "../host/api";
import { BlocklyWorkspace } from "./BlocklyLab";

interface WorkItem {
	id: string;
	title: string;
	createdAt: string;
	tag: string;
}

interface BlockTemplate {
	id: string;
	label: string;
	color: string;
}

interface CanvasBlock extends BlockTemplate {
	instanceId: string;
}

const mockItems: WorkItem[] = [{ id: "1", title: "作品1", createdAt: "2026/3/27 16:16", tag: "E6-RCU" }];
const blockTemplates: BlockTemplate[] = [
	{ id: "move", label: "移动 10 步", color: "#7c62ff" },
	{ id: "turn", label: "右转 15°", color: "#55a7ff" },
	{ id: "say", label: "说 你好", color: "#ff8a65" },
];

export default function App() {
	const [pingText, setPingText] = useState("等待连接主进程...");
	const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await ping();
				if (!cancelled) setPingText(`已连接 · ping => ${res}`);
			} catch (e) {
				if (!cancelled) setPingText(`IPC 异常: ${String(e)}`);
				console.error(e);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const onDragStart = (templateId: string) => {
		return (event: DragEvent<HTMLDivElement>) => {
			event.dataTransfer.setData("application/x-block-template", templateId);
			event.dataTransfer.effectAllowed = "copy";
		};
	};

	const onCanvasDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const templateId = event.dataTransfer.getData("application/x-block-template");
		const template = blockTemplates.find((item) => item.id === templateId);
		if (!template) return;

		setCanvasBlocks((prev) => [
			...prev,
			{
				...template,
				instanceId: `${template.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
			},
		]);
	};

	const removeBlock = (instanceId: string) => {
		setCanvasBlocks((prev) => prev.filter((block) => block.instanceId !== instanceId));
	};

	return (
		<Routes>
			<Route path="/" element={<ProjectListPage pingText={pingText} />} />
			<Route
				path="/project/:id"
				element={
					<ProjectEditorPage
						pingText={pingText}
						canvasBlocks={canvasBlocks}
						onDragStart={onDragStart}
						onCanvasDrop={onCanvasDrop}
						onRemoveBlock={removeBlock}
					/>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

function ProjectListPage({ pingText }: { pingText: string }) {
	const navigate = useNavigate();

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
						{mockItems.map((item) => (
							<div
								key={item.id}
								className="app-card app-card-clickable"
								onClick={() => navigate(`/project/${item.id}`)}
							>
								<div className="app-card-title">{item.title}</div>
								<div className="app-card-meta">
									<span>{item.createdAt}</span>
									<span className="app-tag">{item.tag}</span>
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

interface ProjectEditorPageProps {
	pingText: string;
	canvasBlocks: CanvasBlock[];
	onDragStart: (templateId: string) => (event: DragEvent<HTMLDivElement>) => void;
	onCanvasDrop: (event: DragEvent<HTMLDivElement>) => void;
	onRemoveBlock: (instanceId: string) => void;
}

function ProjectEditorPage({
	pingText,
	canvasBlocks,
	onDragStart,
	onCanvasDrop,
	onRemoveBlock,
}: ProjectEditorPageProps) {
	const navigate = useNavigate();
	const { id } = useParams();
	const editingItem = useMemo(() => mockItems.find((item) => item.id === id), [id]);

	if (!editingItem) return <Navigate to="/" replace />;

	return (
		<>
			<div className="editor-header editor-header-floating">
				<button className="editor-back-btn" onClick={() => navigate("/")}>
					← 返回作品列表
				</button>
				<div className="editor-title">正在编辑：{editingItem.title}</div>
				<div className="app-status-bar editor-status-inline">{pingText}</div>
			</div>
			<BlocklyWorkspace title={`作品：${editingItem.title}`} projectId={editingItem.id} />
		</>
	);
}
