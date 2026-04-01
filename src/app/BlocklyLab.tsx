import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import * as zhHans from "blockly/msg/zh-hans";
import { javascriptGenerator } from "blockly/javascript";
import { loadProjectBlocks, saveProjectBlocks } from "./blocklyStorage";

(Blockly as any).setLocale(zhHans);

// 覆盖 Blockly 内部使用的 prompt，避免在 Electron 中调用浏览器原生 prompt
if ((Blockly as any).dialog && typeof (Blockly as any).dialog.setPrompt === "function") {
	(Blockly as any).dialog.setPrompt((message: string, defaultValue: string, callback: (newValue: string | null) => void) => {
		// 简单自动命名变量：默认名或 "变量_时间戳"
		const name = defaultValue || `变量_${Date.now().toString(16).slice(-4)}`;
		callback(name);
	});
}

const scratchLikeTheme = Blockly.Theme.defineTheme("scratchLike", {
	name: "scratchLike",
	base: Blockly.Themes.Classic,
	componentStyles: {
		workspaceBackgroundColour: "#f2f3f7",
		toolboxBackgroundColour: "#ffffff",
		toolboxForegroundColour: "#575e75",
		flyoutBackgroundColour: "#f7f8fc",
		flyoutForegroundColour: "#575e75",
		flyoutOpacity: 1,
		scrollbarColour: "#c6cad7",
		scrollbarOpacity: 0.7,
		insertionMarkerColour: "#000000",
		insertionMarkerOpacity: 0.2,
	},
	categoryStyles: {
		event_category: { colour: "#ffbf00" },
		motion_category: { colour: "#4c97ff" },
		looks_category: { colour: "#9966ff" },
		control_category: { colour: "#ffab19" },
		sensing_category: { colour: "#5cb1d6" },
		operators_category: { colour: "#59c059" },
		variables_category: { colour: "#ff8c1a" },
		pen_category: { colour: "#0fbd8c" },
		sound_category: { colour: "#d65ac4" },
	},
	blockStyles: {
		motion_blocks: { colourPrimary: "#4c97ff", colourSecondary: "#4280d7", colourTertiary: "#3373cc" },
		looks_blocks: { colourPrimary: "#9966ff", colourSecondary: "#855cd6", colourTertiary: "#774dcb" },
		control_blocks: { colourPrimary: "#ffab19", colourSecondary: "#ec9c13", colourTertiary: "#cf8b17" },
		sensing_blocks: { colourPrimary: "#5cb1d6", colourSecondary: "#47a8d1", colourTertiary: "#2e8eb8" },
		operators_blocks: { colourPrimary: "#59c059", colourSecondary: "#46b946", colourTertiary: "#389438" },
		variables_blocks: { colourPrimary: "#ff8c1a", colourSecondary: "#ff8000", colourTertiary: "#db6e00" },
	},
});

// 简单的电机、传感器自定义块示例
(Blockly as any).Blocks.motor_run = {
	init() {
		this.appendDummyInput()
			.appendField("电机")
			.appendField(
				new (Blockly as any).FieldDropdown([
					["A", "A"],
					["B", "B"],
					["C", "C"],
					["D", "D"],
				]),
				"PORT"
			)
			.appendField("以转速")
			.appendField(new (Blockly as any).FieldNumber(50, -100, 100, 10), "SPEED")
			.appendField("% 运行");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour("#4c97ff");
		this.setTooltip("让某个端口的电机以指定转速运行");
	},
};

(Blockly as any).Blocks.motor_stop = {
	init() {
		this.appendDummyInput()
			.appendField("电机")
			.appendField(
				new (Blockly as any).FieldDropdown([
					["A", "A"],
					["B", "B"],
					["C", "C"],
					["D", "D"],
				]),
				"PORT"
			)
			.appendField("停止");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour("#4c97ff");
		this.setTooltip("停止指定端口的电机");
	},
};

(Blockly as any).Blocks.sensor_distance = {
	init() {
		this.appendDummyInput().appendField("距离传感器（cm）");
		this.setOutput(true, "Number");
		this.setColour("#5cb1d6");
		this.setTooltip("返回距离传感器读数");
	},
};

javascriptGenerator.forBlock["motor_run"] = (block: any) => {
	const port = block.getFieldValue("PORT");
	const speed = block.getFieldValue("SPEED");
	return `motorRun("${port}", ${speed});\n`;
};

javascriptGenerator.forBlock["motor_stop"] = (block: any) => {
	const port = block.getFieldValue("PORT");
	return `motorStop("${port}");\n`;
};

javascriptGenerator.forBlock["sensor_distance"] = () => {
	const code = "readDistance()";
	return [code, (javascriptGenerator as any).ORDER_ATOMIC];
};

interface BlocklyWorkspaceProps {
	title: string;
	projectId: string;
}

export function BlocklyWorkspace({ title, projectId }: BlocklyWorkspaceProps) {
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
	const saveTimer = useRef<number | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		if (!workspaceRef.current) return;

		const toolbox = {
			kind: "categoryToolbox",
			contents: [
				{
					kind: "category",
					name: "电机",
					categorystyle: "motion_category",
					contents: [
						{ kind: "block", type: "motor_run" },
						{ kind: "block", type: "motor_stop" },
					],
				},
				{
					kind: "category",
					name: "移动",
					categorystyle: "motion_category",
					contents: [
						{ kind: "block", type: "motor_run" },
						{ kind: "block", type: "motor_stop" },
					],
				},
				{
					kind: "category",
					name: "矩阵灯",
					categorystyle: "motion_category",
					contents: [
						{ kind: "block", type: "motor_run" },
						{ kind: "block", type: "motor_stop" },
					],
				},
				{
					kind: "category",
					name: "声音",
					categorystyle: "motion_category",
					contents: [
						{ kind: "block", type: "motor_run" },
						{ kind: "block", type: "motor_stop" },
					],
				},
				{
					kind: "category",
					name: "事件",
					categorystyle: "event_category",
					contents: [
						{ kind: "block", type: "controls_if" },
						{ kind: "block", type: "controls_repeat_ext" },
						{ kind: "block", type: "controls_whileUntil" },
					],
				},
				{
					kind: "category",
					name: "传感器",
					categorystyle: "pen_category",
					contents: [
						{ kind: "block", type: "math_number" },
						{ kind: "block", type: "math_arithmetic" },
						{ kind: "block", type: "text_print" },
					],
				},
				{
					kind: "category",
					name: "控制",
					categorystyle: "control_category",
					contents: [
						{ kind: "block", type: "controls_repeat_ext" },
						{ kind: "block", type: "controls_whileUntil" },
						{ kind: "block", type: "controls_for" },
						{ kind: "block", type: "controls_forEach" },
						{ kind: "block", type: "controls_flow_statements" },
						{ kind: "block", type: "controls_if" },
					],
				},
				{
					kind: "category",
					name: "运算",
					categorystyle: "operators_category",
					contents: [
						{ kind: "block", type: "math_number" },
						{ kind: "block", type: "math_arithmetic" },
						{ kind: "block", type: "math_single" },
						{ kind: "block", type: "math_trig" },
						{ kind: "block", type: "math_constant" },
						{ kind: "block", type: "math_number_property" },
						{ kind: "block", type: "math_round" },
						{ kind: "block", type: "math_modulo" },
						{ kind: "block", type: "math_random_int" },
						{ kind: "block", type: "math_random_float" },
					],
				},
				{
					kind: "category",
					name: "变量",
					categorystyle: "variables_category",
					custom: "VARIABLE",
				},
				{
					kind: "category",
					name: "列表",
					categorystyle: "variables_category",
					contents: [
						{ kind: "block", type: "lists_create_with" },
						{ kind: "block", type: "lists_repeat" },
						{ kind: "block", type: "lists_length" },
						{ kind: "block", type: "lists_isEmpty" },
						{ kind: "block", type: "lists_indexOf" },
						{ kind: "block", type: "lists_getIndex" },
						{ kind: "block", type: "lists_setIndex" },
						{ kind: "block", type: "lists_getSublist" },
						{ kind: "block", type: "lists_split" },
						{ kind: "block", type: "lists_sort" },
					],
				},
				{
					kind: "category",
					name: "自制积木",
					categorystyle: "variables_category",
				},
			],
		} as Blockly.utils.toolbox.ToolboxDefinition;

		workspace.current = Blockly.inject(workspaceRef.current, {
			renderer: "zelos",
			theme: scratchLikeTheme,
			toolbox,
			trashcan: true,
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

		const existingXml = loadProjectBlocks(projectId);
		if (existingXml && workspace.current) {
			try {
				const dom = (Blockly.Xml as any).textToDom(existingXml);
				(Blockly.Xml as any).domToWorkspace(dom, workspace.current);
			} catch {
				// ignore malformed xml
			}
		}

		const handleChange = (event: any) => {
			// 跳过纯 UI 事件和视图变更事件，避免不必要的保存
			if (!event || event.isUiEvent) return;
			if (event.type === Blockly.Events.VIEWPORT_CHANGE) return;

			if (saveTimer.current !== null) {
				window.clearTimeout(saveTimer.current);
			}

			saveTimer.current = window.setTimeout(() => {
				if (!workspace.current) return;
				const dom = (Blockly.Xml as any).workspaceToDom(workspace.current);
				const text = (Blockly.Xml as any).domToText(dom);
				saveProjectBlocks(projectId, text);
			}, 200);
		};

		workspace.current.addChangeListener(handleChange);

		const onResize = () => {
			if (!workspace.current || !workspaceRef.current) return;
			Blockly.svgResize(workspace.current);
		};

		window.addEventListener("resize", onResize);
		onResize();

		return () => {
			window.removeEventListener("resize", onResize);
			if (saveTimer.current !== null) {
				window.clearTimeout(saveTimer.current);
				saveTimer.current = null;
			}
			if (workspace.current) {
				workspace.current.removeChangeListener(handleChange);
				workspace.current.dispose();
				workspace.current = null;
			}
		};
	}, [projectId]);

	const handleRun = () => {
		if (!workspace.current) return;
		const code = javascriptGenerator.workspaceToCode(workspace.current);
		console.log("[SnapForge] 运行作品", projectId, "\n", code);
		setIsRunning(true);
	};

	const handleStop = () => {
		setIsRunning(false);
	};

	return (
		<div className="blockly-root">
			<header className="blockly-header">
				<div className="blockly-title">{title}</div>
				<div className="blockly-subtitle">Blockly 拖拽积木工作区</div>
			</header>
			<div className="blockly-workspace-container">
				<div ref={workspaceRef} className="blockly-workspace" />
			</div>
			<div className="blockly-runbar">
				<button type="button" className="blockly-run-btn blockly-stop-btn" onClick={handleStop} disabled={!isRunning}>
					■
				</button>
				<button type="button" className="blockly-run-btn blockly-play-btn" onClick={handleRun}>
					▶
				</button>
			</div>
		</div>
	);
}
