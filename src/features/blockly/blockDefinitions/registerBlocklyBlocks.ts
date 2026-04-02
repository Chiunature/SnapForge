import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { registerEventBlocks } from "./sections/events";
import { registerMotorBlocks } from "./sections/motor";
import { registerLightBlocks } from "./sections/light";
import { registerSoundBlocks } from "./sections/sound";
import { registerSensorBlocks } from "./sections/sensor";

let blocksRegistered = false;

// Blockly 的积木注册入口：
// - 把“每个分类/积木”的定义拆到独立模块里，避免一个 blocks.ts 越写越大
// - 由这里统一注册 Blockly.Blocks 和 javascriptGenerator.forBlock
export function registerBlocklyBlocks() {
	if (blocksRegistered) return;

	// 确保生成器对象存在（防御式写法，避免初始化顺序问题）
	if (!javascriptGenerator || !javascriptGenerator.forBlock) {
		console.warn("[SnapForge] javascriptGenerator forBlock 未就绪");
	}

	registerEventBlocks({ Blockly, javascriptGenerator });
	registerMotorBlocks({ Blockly, javascriptGenerator });
	registerLightBlocks({ Blockly, javascriptGenerator });
	registerSoundBlocks({ Blockly, javascriptGenerator });
	registerSensorBlocks({ Blockly, javascriptGenerator });

	blocksRegistered = true;
}

