import type * as BlocklyType from "blockly";
import { getDropdownField } from "../fieldFactories";
import { blockTexts } from "../blockTexts";
import { type DropdownOption } from "../slotTypes";

const PATTERN_OPTIONS: DropdownOption[] = [
	["笑脸", "SMILE"],
	["心形", "HEART"],
	["箭头", "ARROW"],
];

export function registerLightBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;

	(Blockly as any).Blocks.light_matrix_show = {
		init() {
			this.appendDummyInput()
				.appendField(blockTexts.light_matrix_show.title)
				.appendField(getDropdownField(PATTERN_OPTIONS), "PATTERN");

			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour("#0fbd8c");
		},
	};

	javascriptGenerator.forBlock.light_matrix_show = (block: any) => {
		const pattern = block.getFieldValue("PATTERN");
		return `showMatrixPattern("${pattern}");\n`;
	};
}

