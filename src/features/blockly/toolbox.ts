import * as Blockly from "blockly";

/**
 * Blockly 12 的 JSON 分类项类型为 `StaticCategoryInfo` / `DynamicCategoryInfo`，
 * 其中用于 `getToolboxItemById(...)` 的字段名是 **`id`**，不是旧版文档里的 `toolboxitemid`。
 */
export function createBlocklyToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
	return {
		kind: "categoryToolbox",
		contents: [
			{
				kind: "category",
				id: "events",
				name: "事件",
				categorystyle: "event_category",
				contents: [{ kind: "block", type: "event_when_started" }],
			},
			{
				kind: "category",
				id: "motors",
				name: "电机",
				categorystyle: "motor_category",
				contents: [
					{ kind: "block", type: "motor_run" },
					{ kind: "block", type: "motor_stop" },
				],
			},
			{
				kind: "category",
				id: "lights",
				name: "灯光",
				categorystyle: "light_category",
				contents: [{ kind: "block", type: "light_matrix_show" }],
			},
			{
				kind: "category",
				id: "sounds",
				name: "声音",
				categorystyle: "sound_category",
				contents: [{ kind: "block", type: "sound_play_tone" }],
			},
			{
				kind: "category",
				id: "sensors",
				name: "传感器",
				categorystyle: "sensor_category",
				contents: [
					{ kind: "block", type: "sensor_distance" },
					{ kind: "block", type: "sensor_button_pressed" },
				],
			},
			{
				kind: "category",
				id: "controls",
				name: "控制",
				categorystyle: "control_category",
				contents: [
					{ kind: "block", type: "controls_repeat_ext" },
					{ kind: "block", type: "controls_whileUntil" },
					{ kind: "block", type: "controls_if" },
					{ kind: "block", type: "controls_flow_statements" },
				],
			},
			{
				kind: "category",
				id: "operators",
				name: "运算",
				categorystyle: "operators_category",
				contents: [
					{ kind: "block", type: "math_number" },
					{ kind: "block", type: "math_arithmetic" },
					{ kind: "block", type: "math_round" },
					{ kind: "block", type: "math_modulo" },
					{ kind: "block", type: "logic_compare" },
					{ kind: "block", type: "logic_operation" },
					{ kind: "block", type: "logic_boolean" },
				],
			},
			{
				kind: "category",
				id: "variables",
				name: "变量",
				categorystyle: "variables_category",
				custom: "VARIABLE",
			},
			{
				kind: "category",
				id: "lists",
				name: "列表",
				categorystyle: "variables_category",
				contents: [
					{ kind: "block", type: "lists_create_with" },
					{ kind: "block", type: "lists_length" },
					{ kind: "block", type: "lists_isEmpty" },
					{ kind: "block", type: "lists_getIndex" },
					{ kind: "block", type: "lists_setIndex" },
				],
			},
		],
	};
}
