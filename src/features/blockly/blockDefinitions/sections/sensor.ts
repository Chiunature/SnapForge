import { blockTexts } from "../blockTexts";
import { createDropdownFieldConfig } from "../fieldFactories";
import type * as BlocklyType from "blockly";
import { createBlockDefinition, type JsonBlockDefinition, registerJsonBlocks } from "../jsonBlockDefinition";
import { type DropdownOption } from "../slotTypes";

const BUTTON_OPTIONS: DropdownOption[] = [
	["左", "LEFT"],
	["右", "RIGHT"],
	["中", "CENTER"],
];

const SENSOR_BLOCK_DEFINITIONS: JsonBlockDefinition[] = [
	createBlockDefinition({
		type: "sensor_distance",
		message0: blockTexts.sensor_distance.title,
		output: "Number",
		style: "sensor_blocks",
		classes: ["snapforge-block--sensor", "snapforge-block--subtle"],
	}),
	createBlockDefinition({
		type: "sensor_button_pressed",
		message0: `${blockTexts.sensor_button_pressed.buttonLabel} %1 ${blockTexts.sensor_button_pressed.pressedText}`,
		args0: [createDropdownFieldConfig("BUTTON", BUTTON_OPTIONS)],
		output: "Boolean",
		style: "sensor_blocks",
		classes: ["snapforge-block--sensor"],
	}),
];

export function registerSensorBlocks(args: { Blockly: typeof BlocklyType; javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator }) {
	const { Blockly, javascriptGenerator } = args;
	registerJsonBlocks(Blockly, SENSOR_BLOCK_DEFINITIONS);

	javascriptGenerator.forBlock.sensor_distance = () => ["readDistance()", (javascriptGenerator as any).ORDER_ATOMIC];

	javascriptGenerator.forBlock.sensor_button_pressed = (block: any) => {
		const button = block.getFieldValue("BUTTON");
		return [`isButtonPressed("${button}")`, (javascriptGenerator as any).ORDER_ATOMIC];
	};
}
