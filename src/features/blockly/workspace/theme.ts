import * as Blockly from "blockly";

export const scratchLikeTheme = Blockly.Theme.defineTheme("scratchLike", {
	name: "scratchLike",
	base: Blockly.Themes.Classic,
	// 开启 start hats：
	// 对于“没有上一个连接（previous）但有下一个语句连接（next statement）”的块
	//（例如“当程序开始”），让它们自动渲染成 Blockly 的“起始帽子/hat”外形。
	startHats: true,
	blockStyles: {
		event_blocks: {
			colourPrimary: "#ffbf00",
			colourSecondary: "#e6ac00",
			colourTertiary: "#cc9900",
		},
		motor_blocks: {
			colourPrimary: "#4c97ff",
			colourSecondary: "#4280d7",
			colourTertiary: "#376bb3",
		},
		light_blocks: {
			colourPrimary: "#0fbd8c",
			colourSecondary: "#0da37a",
			colourTertiary: "#0a8665",
		},
		sound_blocks: {
			colourPrimary: "#d65ac4",
			colourSecondary: "#b84da8",
			colourTertiary: "#9b418d",
		},
		sensor_blocks: {
			colourPrimary: "#5cb1d6",
			colourSecondary: "#4f97b6",
			colourTertiary: "#437f99",
		},
	},
	componentStyles: {
		workspaceBackgroundColour: "#f2f3f7", //工作区背景色
		insertionMarkerColour: "#000000", //插入标记颜色
		insertionMarkerOpacity: 0.2, //插入标记透明度
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
	fontStyle: {
		family: "Roboto, sans-serif",
		size: 14,
		weight: "normal",
	},
});
