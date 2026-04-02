import * as Blockly from "blockly";

export function createBlocklyToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
	return {
		kind: "categoryToolbox",
		contents: [
			{
				kind: "category",
				toolboxitemid: "事件",
				name: "事件",
				categorystyle: "event_category",
				contents: [{ kind: "block", type: "event_when_started" }],
			},
			{
				kind: "category",
				toolboxitemid: "电机",
				name: "电机",
				categorystyle: "motor_category",
				contents: [
					{ kind: "block", type: "motor_run" },
					{ kind: "block", type: "motor_stop" },
				],
			},
			{
				kind: "category",
				toolboxitemid: "灯光",
				name: "灯光",
				categorystyle: "light_category",
				contents: [{ kind: "block", type: "light_matrix_show" }],
			},
			{
				kind: "category",
				toolboxitemid: "声音",
				name: "声音",
				categorystyle: "sound_category",
				contents: [{ kind: "block", type: "sound_play_tone" }],
			},
			{
				kind: "category",
				toolboxitemid: "传感器",
				name: "传感器",
				categorystyle: "sensor_category",
				contents: [
					{ kind: "block", type: "sensor_distance" },
					{ kind: "block", type: "sensor_button_pressed" },
				],
			},
			{
				kind: "category",
				toolboxitemid: "控制",
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
				toolboxitemid: "运算",
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
				toolboxitemid: "变量",
				name: "变量",
				categorystyle: "variables_category",
				custom: "VARIABLE",
			},
			{
				kind: "category",
				toolboxitemid: "列表",
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
