import { blockTexts } from "../blockTexts";
import { createDropdownFieldConfig, createNumberFieldConfig } from "../fieldFactories";
import type * as BlocklyType from "blockly";
import { createBlockDefinition, type JsonBlockDefinition, registerJsonBlocks } from "../jsonBlockDefinition";
import { type DropdownOption } from "../slotTypes";

const PORT_OPTIONS: DropdownOption[] = [
	["A", "A"],
	["B", "B"],
	["C", "C"],
	["D", "D"],
];

const MOTOR_BLOCK_DEFINITIONS: JsonBlockDefinition[] = [
	createBlockDefinition({
		type: "motor_run",
		message0: `${blockTexts.motor_run.title} %1 ${blockTexts.motor_run.speedPrefix} %2 ${blockTexts.motor_run.speedSuffix}`,
		args0: [
			createDropdownFieldConfig("PORT", PORT_OPTIONS),
			createNumberFieldConfig("SPEED", 50, -100, 100, 10),
		],
		previousStatement: null,
		nextStatement: null,
		inputsInline: true,
		style: "motor_blocks",
		classes: ["snapforge-block--motor", "snapforge-block--compact"],
	}),
	createBlockDefinition({
		type: "motor_stop",
		message0: `${blockTexts.motor_stop.title} %1 ${blockTexts.motor_stop.stopText}`,
		args0: [createDropdownFieldConfig("PORT", PORT_OPTIONS)],
		previousStatement: null,
		nextStatement: null,
		inputsInline: true,
		style: "motor_blocks",
		classes: ["snapforge-block--motor", "snapforge-block--subtle"],
	}),
];

export function registerMotorBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;
	registerJsonBlocks(Blockly, MOTOR_BLOCK_DEFINITIONS);

	javascriptGenerator.forBlock.motor_run = (block: any) => {
		const port = block.getFieldValue("PORT");
		const speed = block.getFieldValue("SPEED");
		return `motorRun("${port}", ${speed});\n`;
	};

	javascriptGenerator.forBlock.motor_stop = (block: any) => {
		const port = block.getFieldValue("PORT");
		return `motorStop("${port}");\n`;
	};
}

