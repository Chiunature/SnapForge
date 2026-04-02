import * as Blockly from "blockly";

export const scratchLikeTheme = Blockly.Theme.defineTheme("scratchLike", {
	name: "scratchLike",
	base: Blockly.Themes.Classic,
	// 开启 start hats：
	// 对于“没有上一个连接（previous）但有下一个语句连接（next statement）”的块
	//（例如“当程序开始”），让它们自动渲染成 Blockly 的“起始帽子/hat”外形。
	startHats: true,
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
		motor_category: { colour: "#4c97ff" },
		light_category: { colour: "#0fbd8c" },
		sound_category: { colour: "#d65ac4" },
		sensor_category: { colour: "#5cb1d6" },
		control_category: { colour: "#ffab19" },
		operators_category: { colour: "#59c059" },
		variables_category: { colour: "#ff8c1a" },
	},
});
