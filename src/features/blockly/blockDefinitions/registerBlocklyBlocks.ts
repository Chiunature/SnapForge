import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { registerEventBlocks } from "./sections/events";
import { registerMotorBlocks } from "./sections/motor";
import { registerLightBlocks } from "./sections/light";
import { registerSoundBlocks } from "./sections/sound";
import { registerSensorBlocks } from "./sections/sensor";

let blocksRegistered = false;

const blockRegistrars = [
	registerEventBlocks,
	registerMotorBlocks,
	registerLightBlocks,
	registerSoundBlocks,
	registerSensorBlocks,
];

// Blockly 的积木注册入口：
// - 各 section 内部用 defineBlocksWithJsonArray 注册 JSON 积木定义
// - 这里统一串联所有自定义块定义与 javascriptGenerator.forBlock
export function registerBlocklyBlocks() {
	if (blocksRegistered) return;

	// 确保生成器对象存在（防御式写法，避免初始化顺序问题）
	if (!javascriptGenerator || !javascriptGenerator.forBlock) {
		console.warn("[SnapForge] javascriptGenerator forBlock 未就绪");
	}

	for (const registerBlocks of blockRegistrars) {
		registerBlocks({ Blockly, javascriptGenerator });
	}

	blocksRegistered = true;
}
