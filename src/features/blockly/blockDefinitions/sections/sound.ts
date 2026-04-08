import { blockTexts } from "../blockTexts";
import { createNumberFieldConfig } from "../fieldFactories";
import type * as BlocklyType from "blockly";
import { createBlockDefinition, type JsonBlockDefinition, registerJsonBlocks } from "../jsonBlockDefinition";

const SOUND_BLOCK_DEFINITIONS: JsonBlockDefinition[] = [
	createBlockDefinition({
		type: "sound_play_tone",
		message0: `${blockTexts.sound_play_tone.title} %1 ${blockTexts.sound_play_tone.durationPrefix} %2 ${blockTexts.sound_play_tone.durationSuffix}`,
		args0: [createNumberFieldConfig("FREQUENCY", 440, 100, 2000, 10), createNumberFieldConfig("SECONDS", 1, 0, 10, 0.1)],
		previousStatement: null,
		nextStatement: null,
		inputsInline: true,
		style: "sound_blocks",
		classes: ["snapforge-block--sound"],
	}),
];

export function registerSoundBlocks(args: { Blockly: typeof BlocklyType; javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator }) {
	const { Blockly, javascriptGenerator } = args;
	registerJsonBlocks(Blockly, SOUND_BLOCK_DEFINITIONS);

	javascriptGenerator.forBlock.sound_play_tone = (block: any) => {
		const frequency = block.getFieldValue("FREQUENCY");
		const seconds = block.getFieldValue("SECONDS");
		return `playTone(${frequency}, ${seconds});\n`;
	};
}
