import type * as BlocklyType from "blockly";
import { blockTexts } from "../blockTexts";

export function registerEventBlocks(args: {
	Blockly: typeof BlocklyType;
	javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator;
}) {
	const { Blockly, javascriptGenerator } = args;

	(Blockly as any).Blocks.event_when_started = {
		init() {
			this.appendDummyInput().appendField(blockTexts.event_when_started.title);
			this.setNextStatement(true, null);
			this.setColour("#ffbf00");
			this.setTooltip(blockTexts.event_when_started.tooltip);
		},
	};

	javascriptGenerator.forBlock.event_when_started = () => blockTexts.event_when_started.generatorComment;
}

