import { blockTexts } from "../blockTexts";
import { createDropdownFieldConfig } from "../fieldFactories";
import type * as BlocklyType from "blockly";
import { createBlockDefinition, type JsonBlockDefinition, registerJsonBlocks } from "../jsonBlockDefinition";
import { type DropdownOption } from "../slotTypes";

const PATTERN_OPTIONS: DropdownOption[] = [
	["笑脸", "SMILE"],
	["心形", "HEART"],
	["箭头", "ARROW"],
];

const LIGHT_BLOCK_DEFINITIONS: JsonBlockDefinition[] = [
	createBlockDefinition({
		type: "light_matrix_show",
		message0: `${blockTexts.light_matrix_show.title} %1`,
		args0: [createDropdownFieldConfig("PATTERN", PATTERN_OPTIONS)],
		previousStatement: null,
		nextStatement: null,
		inputsInline: true,
		style: "light_blocks",
		classes: ["snapforge-block--light", "snapforge-block--compact"],
	}),
];

export function registerLightBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;
	registerJsonBlocks(Blockly, LIGHT_BLOCK_DEFINITIONS);

	javascriptGenerator.forBlock.light_matrix_show = (block: any) => {
		const pattern = block.getFieldValue("PATTERN");
		return `showMatrixPattern("${pattern}");\n`;
	};
}

