/**
 * Blockly 编辑器容器（被路由里的作品编辑页引用，例如 ProjectEditorPage）。
 *
 * 主要职责：
 * 1. 在挂载时调用 Blockly.inject，把画布挂到 ref 指向的 div 上；
 * 2. 注册连续工具箱插件、自定义积木、中文语言包；
 * 3. 用我们自己的 CategoryToolbar 操作隐藏的 Blockly 原生 toolbox，保证飞出积木栏与侧边栏同步；
 * 4. 监听工作区变化，防抖后把积木序列化成 XML 存本地（见 storage.ts）。
 */
import { useEffect, useRef, useState } from "react";
// Blockly 核心：注入工作区、XML、事件类型、主题用到的常量等
import * as Blockly from "blockly";
// Blockly 自带中文文案（菜单、部分内置块等），通过 setLocale 全局生效
import * as zhHans from "blockly/msg/zh-hans";
// 连续滚动式工具箱：register 往 Blockly 注册类名；ContinuousFlyout 用于运行时打补丁
import { ContinuousFlyout, registerContinuousToolbox } from "@blockly/continuous-toolbox";
// 把当前工作区里的积木转成 JavaScript 字符串（运行按钮用）
import { javascriptGenerator } from "blockly/javascript";
// 注册本项目自定义积木（定义在 blockDefinitions/ 下）
import { registerBlocklyBlocks } from "./blocks";
// 左侧分类栏：内部会调 workspace.getToolbox().setSelectedItem(...) 切换分类
import { CategoryToolbar } from "./CategoryToolbar";
// 与 toolbox.ts 里分类 name 一致，用于判断侧边栏高亮与 Blockly 分类是否对应
import { CATEGORIES } from "./categories";
// 覆盖 Blockly 的对话框（prompt/confirm 等），避免浏览器默认框在 Electron 里体验不一致
import { setupBlocklyDialog } from "./dialog";
// 按 projectId 读写本地保存的积木 XML
import { clearProjectBlocks, loadProjectBlocks, saveProjectBlocks } from "./storage";
// 工作区主题（含 startHats 等）
import { scratchLikeTheme } from "./theme";
// 生成 toolbox JSON，传给 inject 的 toolbox 选项
import { createBlocklyToolbox } from "./toolbox";

// 定义组件的属性类型：接收一个项目ID
interface BlocklyWorkspaceProps {
	projectId: string;
}

// 标记是否已经注册过连续工具箱插件（避免重复注册）
let continuousToolboxRegistered = false;

/**
 * 补丁：`@blockly/continuous-toolbox` 在飞出栏平滑滚动时会反复调用内部的
 * `selectCategoryByScrollPosition` → `toolbox.selectCategoryByName`。
 * 我们在下面用同名方法包装了 `selectCategoryByName`，会同步更新 React 的 `activeCategory`，
 * 若滚动过程中也不断触发，侧边栏就会出现「从当前分类逐个高亮到目标」的动画。
 *
 * 插件原本用 `if (this.scrollTarget) return` 想在滚动时暂停更新，但滚到第一个分类时
 * `scrollTarget === 0` 被判成假，失效。这里改为 `scrollTarget !== undefined` 即可。
 *
 * 调用时机：仅在首次 `registerContinuousToolbox()` 之后执行一次，改的是原型方法，全局生效。
 */
function patchContinuousFlyoutSelectionTraversal() {
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

// Blockly 工作区组件
export function BlocklyWorkspace({ projectId }: BlocklyWorkspaceProps) {
	// useRef: 创建引用，用于直接访问DOM元素，不会触发重新渲染
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const workspaceInstanceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const saveTimerRef = useRef<number | null>(null);
	const manualSelectLockRef = useRef<{ name: string; until: number } | null>(null);

	// useState: 状态管理，返回[当前值, 更新函数]
	const [isRunning, setIsRunning] = useState(false); // 是否正在运行
	const [activeCategory, setActiveCategory] = useState(""); // 当前选中的积木分类
	const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null); // Blockly工作区实例

	const handleToolbarSelect = (name: string, source = "toolbar-click") => {
		const lockMs = 450;
		manualSelectLockRef.current = { name, until: Date.now() + lockMs };
		console.log("[SnapForge][CategorySync] toolbar select", { name, source, lockMs, prev: activeCategory });
		setActiveCategory((prev) => (prev === name ? prev : name));
	};

	// useEffect：挂载时创建 Blockly 工作区；卸载时 dispose、解绑监听（依赖 projectId 时整页换作品会重来一遍）
	useEffect(() => {
		if (!workspaceRef.current) {
			return;
		}

		// 全局：Blockly 内置 UI 字符串改为中文（需在 inject 前或后调用均可，习惯放 inject 前）
		Blockly.setLocale(zhHans as any);
		// 全局：替换 window.prompt 等，使 Blockly 弹窗走统一逻辑（定义在 ./dialog.ts）
		setupBlocklyDialog();
		// 全局：往 Blockly.Blocks / javascriptGenerator 注册方块（幂等，内部有开关）
		registerBlocklyBlocks();

		// 全局：向 Blockly.registry 注册 ContinuousToolbox / ContinuousFlyout 等；
		// inject 读 plugins.* 字符串时会从这里解析出具体类。只应注册一次。
		if (!continuousToolboxRegistered) {
			registerContinuousToolbox();
			patchContinuousFlyoutSelectionTraversal();
			continuousToolboxRegistered = true;
		}

		/*
		核心 API：在 DOM 节点上创建 WorkspaceSvg，返回实例 ws（画布、滚动、缩放等由此管理）
		第一个参数是指定容器，div的id或者dom元素对象本身
		第二个参数是配置对象
		*/
		const ws = Blockly.inject(workspaceRef.current, {
			// zelos：圆角积木外观，与 Scratch 更接近
			renderer: "zelos",
			theme: scratchLikeTheme,
			toolbox: createBlocklyToolbox(),
			//自定义插件
			plugins: {
				flyoutsVerticalToolbox: "ContinuousFlyout", // 垂直飞出栏用连续滚动实现（插件注册的 registry 名）
				metricsManager: "ContinuousMetrics", // 主画布视口计算时扣除工具箱+ flyout 占位（避免内容被挡）
				toolbox: "ContinuousToolbox", // 工具箱逻辑类：ContinuousToolbox（原生树形被换掉）
			},
			trashcan: false,
			sounds: false,
			grid: {
				spacing: 40,
				length: 40,
				colour: "#c5e6f7",
				snap: true,
			},
			zoom: {
				controls: true,
				wheel: true,
				startScale: 0.7,
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
		// 传给 CategoryToolbar：拿到 toolbox 做 setSelectedItem；状态变会触发子组件重渲染
		setWorkspace(ws);

		// getToolbox()：inject 根据 toolbox 配置创建的工具箱实例；飞出栏、分类选中态都由它驱动。
		// 下面把原生工具箱 DOM 挤到宽度 0：视觉上只有左侧 CategoryToolbar，逻辑仍走 toolbox API。
		const toolbox = ws.getToolbox() as any;
		const originalSelectCategoryByName = typeof toolbox?.selectCategoryByName === "function" ? toolbox.selectCategoryByName.bind(toolbox) : null;

		// selectCategoryByName：ContinuousFlyout 滚动时、或我们点侧边栏 setSelectedItem 触发的流程里会调到；
		// 包装一层以便 Blockly 内部切换分类时，React 侧边栏 `activeCategory` 保持同步。
		if (originalSelectCategoryByName) {
			toolbox.selectCategoryByName = (name: string) => {
				const lock = manualSelectLockRef.current;
				const now = Date.now();
				const isLocked = Boolean(lock && now <= lock.until);
				const canOverride = !isLocked || lock?.name === name;

				console.log("[SnapForge][CategorySync] toolbox.selectCategoryByName", {
					name,
					prevActive: activeCategory,
					lockName: lock?.name ?? null,
					lockRemainingMs: lock ? Math.max(0, lock.until - now) : 0,
					canOverride,
				});

				originalSelectCategoryByName(name);
				if (CATEGORIES.some((c) => c.name === name)) {
					if (!canOverride) {
						console.warn("[SnapForge][CategorySync] ignore transient category change while locked", {
							incoming: name,
							lockedTo: lock?.name,
						});
						return;
					}
					setActiveCategory((prev) => (prev === name ? prev : name));
				}
			};
		}

		// HtmlDiv：工具箱根 DOM；不设 display:none（否则 flyout 可能异常），用宽度 0 隐藏
		const toolboxEl: HTMLElement | null = toolbox?.HtmlDiv ?? null;
		if (toolboxEl) {
			toolboxEl.style.width = "0";
			toolboxEl.style.minWidth = "0";
			toolboxEl.style.overflow = "hidden";
			toolboxEl.style.padding = "0";
			toolboxEl.style.margin = "0";
		}

		// setSelectedItem / getToolboxItemById：与 toolbox 里 category 的 id（与 name 一致）对应，打开页面默认对齐第一项分类
		const firstCategory = CATEGORIES[0]?.name;
		if (firstCategory) {
			const firstItem = toolbox?.getToolboxItemById?.(firstCategory);
			if (firstItem) {
				toolbox.setSelectedItem(firstItem);
				setActiveCategory(firstCategory);
				console.log("[SnapForge][CategorySync] init first category", { firstCategory });
			}
		}

		const existingXml = loadProjectBlocks(projectId);
		if (existingXml) {
			try {
				// Blockly.Xml：积木序列化 API；textToDom / domToWorkspace 把存盘的 XML 还原到画布
				const xmlDom = (Blockly.Xml as any).textToDom(existingXml);
				(Blockly.Xml as any).domToWorkspace(xmlDom, ws);
			} catch {
				console.warn("[SnapForge] 读取作品积木失败，已清除损坏数据");
				clearProjectBlocks(projectId);
			}
		}

		// addChangeListener：Blockly 在创建/移动/删除块等时派发事件；这里做防抖自动保存
		const handleWorkspaceChange = (event: any) => {
			// isUiEvent：如选中块、点开菜单等，不触发保存
			// VIEWPORT_CHANGE：平移/缩放视口，与积木内容无关，不保存
			if (!event || event.isUiEvent || event.type === Blockly.Events.VIEWPORT_CHANGE) {
				return;
			}

			// 清除之前的定时器
			if (saveTimerRef.current !== null) {
				window.clearTimeout(saveTimerRef.current);
			}

			// 设置新的定时器，200ms后保存（防抖）
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
				// svgResize：容器尺寸变化后通知 Blockly 重算布局/滚动条（否则画布可能裁切或留白）
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
			// dispose：释放 DOM、监听、快捷键等；Must 调，否则泄漏与重复 inject 会异常
			ws.dispose();
			workspaceInstanceRef.current = null;
			setWorkspace(null);
			manualSelectLockRef.current = null;
		};
	}, [projectId]);

	const handleRun = () => {
		const ws = workspaceInstanceRef.current;
		if (!ws) return;
		// javascriptGenerator.workspaceToCode：遍历工作区积木树，按 forBlock 注册表生成代码字符串（当前仅 console，可接执行器）
		const generatedCode = javascriptGenerator.workspaceToCode(ws);
		console.log("[SnapForge] 运行作品", projectId, "\n", generatedCode);
		setIsRunning(true);
	};

	// 停止按钮的处理函数
	const handleStop = () => {
		setIsRunning(false);
	};

	return (
		<div className="blockly-root">
			{/* CategoryToolbar：用户点击分类 → handleClick 内 toolbox.setSelectedItem → 连续工具箱滚动 flyout；activeCategory 只负责高亮 */}
			<CategoryToolbar workspace={workspace} activeCategory={activeCategory} onSelect={handleToolbarSelect} />

			<div className="blockly-workspace-container">
				{/* Blockly.inject 会把 SVG 画布挂到这个 div 下 */}
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
