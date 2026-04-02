import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import * as zhHans from "blockly/msg/zh-hans";
import { ContinuousFlyout, registerContinuousToolbox } from "@blockly/continuous-toolbox";
import { javascriptGenerator } from "blockly/javascript";
import { registerBlocklyBlocks } from "./blocks";
import { CategoryToolbar } from "./CategoryToolbar";
import { CATEGORIES } from "./categories";
import { setupBlocklyDialog } from "./dialog";
import { clearProjectBlocks, loadProjectBlocks, saveProjectBlocks } from "./storage";
import { scratchLikeTheme } from "./theme";
import { createBlocklyToolbox } from "./toolbox";

interface BlocklyWorkspaceProps {
	projectId: string;
}

let continuousToolboxRegistered = false;

function patchContinuousFlyoutSelectionTraversal() {
	// 由于使用了 `@blockly/continuous-toolbox`，它在平滑滚动分类时会不断触发
	// `selectCategoryByScrollPosition`，从而调用 `toolbox.selectCategoryByName(...)`。
	// 而我们这里的 `selectCategoryByName` 会反过来更新 React 状态 `activeCategory`，
	// 导致侧边栏按钮出现“从当前到目标分类逐个高亮”的遍历动画。
	//
	// 插件内部的保护条件写的是 `if (this.scrollTarget) return;`。
	// 当滚动目标刚好是顶部时，`scrollTarget === 0` 会被当成 falsy，从而没能正确暂停。
	// 我们将判断改为只要 `scrollTarget !== undefined` 就暂停滚动过程中的选中态更新，
	// 这样侧边栏不会在滚动动画期间逐项遍历。
	const proto = (ContinuousFlyout as any)?.prototype as any;
	if (!proto || proto.__snapforge_noTraversalPatched) return;

	proto.__snapforge_noTraversalPatched = true;

	proto.selectCategoryByScrollPosition = function (position: number) {
		if ((this as any).scrollTarget !== undefined) return;

		const scaledPosition = Math.round(position / this.getWorkspace().scale);
		for (const [name, catPosition] of [...(this as any).scrollPositions.entries()].reverse()) {
			if (scaledPosition >= catPosition) {
				(this as any).getParentToolbox?.().selectCategoryByName(name);
				return;
			}
		}
	};
}

export function BlocklyWorkspace({ projectId }: BlocklyWorkspaceProps) {
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const workspaceInstanceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const saveTimerRef = useRef<number | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [activeCategory, setActiveCategory] = useState("");
	const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

	useEffect(() => {
		if (!workspaceRef.current) {
			return;
		}

		Blockly.setLocale(zhHans as any);
		setupBlocklyDialog();
		registerBlocklyBlocks();
		if (!continuousToolboxRegistered) {
			registerContinuousToolbox();
			patchContinuousFlyoutSelectionTraversal();
			continuousToolboxRegistered = true;
		}

		const ws = Blockly.inject(workspaceRef.current, {
			renderer: "zelos",
			theme: scratchLikeTheme,
			toolbox: createBlocklyToolbox(),
			plugins: {
				flyoutsVerticalToolbox: "ContinuousFlyout",
				metricsManager: "ContinuousMetrics",
				toolbox: "ContinuousToolbox",
			},
			trashcan: true,
			sounds: false,
			grid: {
				spacing: 20,
				length: 3,
				colour: "#e0e0e0",
				snap: true,
			},
			zoom: {
				controls: true,
				wheel: true,
				startScale: 1,
				maxScale: 2,
				minScale: 0.5,
			},
			move: {
				scrollbars: true,
				drag: true,
				wheel: true,
			},
		});

		workspaceInstanceRef.current = ws;
		setWorkspace(ws);

		// 隐藏 Blockly 默认工具箱的视觉显示，但保留 DOM（display:none 会导致 Flyout 失效）
		const toolbox = ws.getToolbox() as any;
		const originalSelectCategoryByName = typeof toolbox?.selectCategoryByName === "function" ? toolbox.selectCategoryByName.bind(toolbox) : null;
		if (originalSelectCategoryByName) {
			toolbox.selectCategoryByName = (name: string) => {
				originalSelectCategoryByName(name);
				if (CATEGORIES.some((c) => c.name === name)) {
					setActiveCategory((prev) => (prev === name ? prev : name));
				}
			};
		}
		const toolboxEl: HTMLElement | null = toolbox?.HtmlDiv ?? null;
		if (toolboxEl) {
			toolboxEl.style.width = "0";
			toolboxEl.style.minWidth = "0";
			toolboxEl.style.overflow = "hidden";
			toolboxEl.style.padding = "0";
			toolboxEl.style.margin = "0";
		}
		const firstCategory = CATEGORIES[0]?.name;
		if (firstCategory) {
			const firstItem = toolbox?.getToolboxItemById?.(firstCategory);
			if (firstItem) {
				toolbox.setSelectedItem(firstItem);
				setActiveCategory(firstCategory);
			}
		}

		const existingXml = loadProjectBlocks(projectId);
		if (existingXml) {
			try {
				const xmlDom = (Blockly.Xml as any).textToDom(existingXml);
				(Blockly.Xml as any).domToWorkspace(xmlDom, ws);
			} catch {
				console.warn("[SnapForge] 读取作品积木失败，已清除损坏数据");
				clearProjectBlocks(projectId);
			}
		}

		const handleWorkspaceChange = (event: any) => {
			if (!event || event.isUiEvent || event.type === Blockly.Events.VIEWPORT_CHANGE) {
				return;
			}

			if (saveTimerRef.current !== null) {
				window.clearTimeout(saveTimerRef.current);
			}

			saveTimerRef.current = window.setTimeout(() => {
				const current = workspaceInstanceRef.current;
				if (!current) return;
				const xmlDom = (Blockly.Xml as any).workspaceToDom(current);
				const xmlText = (Blockly.Xml as any).domToText(xmlDom);
				saveProjectBlocks(projectId, xmlText);
			}, 200);
		};

		const handleResize = () => {
			if (workspaceInstanceRef.current) {
				Blockly.svgResize(workspaceInstanceRef.current);
			}
		};

		ws.addChangeListener(handleWorkspaceChange);
		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);

			if (saveTimerRef.current !== null) {
				window.clearTimeout(saveTimerRef.current);
				saveTimerRef.current = null;
			}

			ws.removeChangeListener(handleWorkspaceChange);
			ws.dispose();
			workspaceInstanceRef.current = null;
			setWorkspace(null);
		};
	}, [projectId]);

	const handleRun = () => {
		const ws = workspaceInstanceRef.current;
		if (!ws) return;
		const generatedCode = javascriptGenerator.workspaceToCode(ws);
		console.log("[SnapForge] 运行作品", projectId, "\n", generatedCode);
		setIsRunning(true);
	};

	const handleStop = () => {
		setIsRunning(false);
	};

	return (
		<div className="blockly-root">
			<CategoryToolbar workspace={workspace} activeCategory={activeCategory} onSelect={setActiveCategory} />

			<div className="blockly-workspace-container">
				<div ref={workspaceRef} className="blockly-workspace" />
			</div>

			<div className="blockly-runbar">
				<button type="button" className="blockly-run-btn blockly-stop-btn" disabled={!isRunning} onClick={handleStop}>
					■
				</button>
				<button type="button" className="blockly-run-btn blockly-play-btn" onClick={handleRun}>
					▶
				</button>
			</div>
		</div>
	);
}
