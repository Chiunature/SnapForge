import type * as BlocklyType from "blockly";
import { getDropdownField, getNumberField } from "../fieldFactories";
import { blockTexts } from "../blockTexts";
import { type DropdownOption } from "../slotTypes";

const PORT_OPTIONS: DropdownOption[] = [
	["A", "A"],
	["B", "B"],
	["C", "C"],
	["D", "D"],
];

export function registerMotorBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;

	(Blockly as any).Blocks.motor_run = {
		init() {
			this.appendDummyInput()
				.appendField(blockTexts.motor_run.title)
				.appendField(getDropdownField(PORT_OPTIONS), "PORT")
				.appendField(blockTexts.motor_run.speedPrefix)
				.appendField(getNumberField(50, -100, 100, 10), "SPEED")
				.appendField(blockTexts.motor_run.speedSuffix);

			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour("#4c97ff");
		},
	};

	(Blockly as any).Blocks.motor_stop = {
		init() {
			this.appendDummyInput()
				.appendField(blockTexts.motor_stop.title)
				.appendField(getDropdownField(PORT_OPTIONS), "PORT")
				.appendField(blockTexts.motor_stop.stopText);

			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour("#4c97ff");
		},
	};

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

