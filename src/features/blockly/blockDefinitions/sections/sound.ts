import type * as BlocklyType from "blockly";
import { getNumberField } from "../fieldFactories";
import { blockTexts } from "../blockTexts";

export function registerSoundBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;

	(Blockly as any).Blocks.sound_play_tone = {
		init() {
			this.appendDummyInput()
				.appendField(blockTexts.sound_play_tone.title)
				.appendField(getNumberField(440, 100, 2000, 10), "FREQUENCY")
				.appendField(blockTexts.sound_play_tone.durationPrefix)
				.appendField(getNumberField(1, 0, 10, 0.1), "SECONDS")
				.appendField(blockTexts.sound_play_tone.durationSuffix);

			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour("#d65ac4");
		},
	};

	javascriptGenerator.forBlock.sound_play_tone = (block: any) => {
		const frequency = block.getFieldValue("FREQUENCY");
		const seconds = block.getFieldValue("SECONDS");
		return `playTone(${frequency}, ${seconds});\n`;
	};
}

