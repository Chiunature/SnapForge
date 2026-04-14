import { blockTexts } from "../blockTexts";
import type * as BlocklyType from "blockly";
import { createBlockDefinition, type JsonBlockDefinition, registerJsonBlocks } from "../jsonBlockDefinition";

const EVENT_BLOCK_DEFINITIONS: JsonBlockDefinition[] = [
	createBlockDefinition({
		type: "event_when_started",
		message0: blockTexts.event_when_started.title,
		nextStatement: null,
		style: "event_blocks",
		// 事件块用 classes 把“更显眼的帽子块”视觉交给 CSS，后续新增同类块可复用。
		classes: ["snapforge-block--event"],
	}),
];

export function registerEventBlocks(args: { Blockly: typeof BlocklyType; javascriptGenerator: typeof import("blockly/javascript").javascriptGenerator }) {
	const { Blockly, javascriptGenerator } = args;
	registerJsonBlocks(Blockly, EVENT_BLOCK_DEFINITIONS);

	javascriptGenerator.forBlock.event_when_started = () => blockTexts.event_when_started.generatorComment;
}
