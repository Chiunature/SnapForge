import type {
	JsonDropdownFieldConfig,
	JsonImageFieldConfig,
	JsonNumberFieldConfig,
} from "./jsonBlockDefinition";
import { type DropdownOption, type DropdownSlotSpec, type NumberSlotSpec } from "./slotTypes";
import { type IconSpec } from "./iconTypes";

export function createDropdownFieldConfig(fieldName: string, options: DropdownOption[]): JsonDropdownFieldConfig {
	return {
		type: "field_dropdown",
		name: fieldName,
		options,
	} as const;
}

export function createNumberFieldConfig(
	fieldName: string,
	defaultValue: number,
	min?: number,
	max?: number,
	precision?: number,
): JsonNumberFieldConfig {
	return {
		type: "field_number",
		name: fieldName,
		value: defaultValue,
		min,
		max,
		precision,
	} as const;
}

// 使用 slot spec 生成 JSON 字段配置，便于后续按配置声明块结构。
export function createDropdownFieldConfigFromSlot(slot: DropdownSlotSpec) {
	return createDropdownFieldConfig(slot.fieldName, slot.options);
}

export function createNumberFieldConfigFromSlot(slot: NumberSlotSpec) {
	return createNumberFieldConfig(slot.fieldName, slot.defaultValue, slot.min, slot.max, slot.precision);
}

export function createIconFieldConfig(fieldName: string, icon: IconSpec): JsonImageFieldConfig {
	return {
		type: "field_image",
		name: fieldName,
		src: icon.src,
		width: icon.width,
		height: icon.height,
		alt: icon.alt ?? "*",
	} as const;
}

