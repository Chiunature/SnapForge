import * as Blockly from "blockly";
import { type DropdownOption, type DropdownSlotSpec, type NumberSlotSpec } from "./slotTypes";
import { type IconSpec } from "./iconTypes";

// 保留你原本的“函数式接口”，方便你后续不大改原有调用方式。
export function getDropdownField(options: DropdownOption[]) {
	return new (Blockly as any).FieldDropdown(options);
}

export function getNumberField(defaultValue: number, min?: number, max?: number, precision?: number) {
	return new (Blockly as any).FieldNumber(defaultValue, min, max, precision);
}

// 使用 slot spec 生成字段（更适合做成配置/自定义文本/插槽扩展）。
export function createDropdownField(slot: DropdownSlotSpec) {
	return getDropdownField(slot.options);
}

export function createNumberField(slot: NumberSlotSpec) {
	return getNumberField(slot.defaultValue, slot.min, slot.max, slot.precision);
}

export function createIconField(icon: IconSpec) {
	// Blockly 的 FieldImage 在类型上不一定是公开的，这里用 any 兼容。
	// 插槽：把图片作为 block 内字段插进去。
	return new (Blockly as any).FieldImage(icon.src, icon.width, icon.height, icon.alt ?? "*");
}

