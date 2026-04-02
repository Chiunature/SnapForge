import type * as BlocklyType from "blockly";
import { getDropdownField } from "../fieldFactories";
import { blockTexts } from "../blockTexts";
import { type DropdownOption } from "../slotTypes";

const BUTTON_OPTIONS: DropdownOption[] = [
	["左", "LEFT"],
	["右", "RIGHT"],
	["中", "CENTER"],
];

export function registerSensorBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;

	(Blockly as any).Blocks.sensor_distance = {
		init() {
			this.appendDummyInput().appendField(blockTexts.sensor_distance.title);
			this.setOutput(true, "Number");
			this.setColour("#5cb1d6");
		},
	};

	(Blockly as any).Blocks.sensor_button_pressed = {
		init() {
			this.appendDummyInput()
				.appendField(blockTexts.sensor_button_pressed.buttonLabel)
				.appendField(getDropdownField(BUTTON_OPTIONS), "BUTTON")
				.appendField(blockTexts.sensor_button_pressed.pressedText);

			this.setOutput(true, "Boolean");
			this.setColour("#5cb1d6");
		},
	};

	javascriptGenerator.forBlock.sensor_distance = () => [
		"readDistance()",
		(javascriptGenerator as any).ORDER_ATOMIC,
	];

	javascriptGenerator.forBlock.sensor_button_pressed = (block: any) => {
		const button = block.getFieldValue("BUTTON");
		return [`isButtonPressed("${button}")`, (javascriptGenerator as any).ORDER_ATOMIC];
	};
}

