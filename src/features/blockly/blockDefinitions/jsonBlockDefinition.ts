import type * as BlocklyType from "blockly";
import type { DropdownOption } from "./slotTypes";

export interface JsonDropdownFieldConfig {
	type: "field_dropdown";
	name: string;
	options: DropdownOption[];
}

export interface JsonNumberFieldConfig {
	type: "field_number";
	name: string;
	value: number;
	min?: number;
	max?: number;
	precision?: number;
}

export interface JsonInputFieldConfig {
	type: "field_input";
	name: string;
	text?: string;
}

export interface JsonImageFieldConfig {
	type: "field_image";
	name: string;
	src: string;
	width: number;
	height: number;
	alt?: string;
}

export type JsonFieldConfig =
	| JsonDropdownFieldConfig
	| JsonNumberFieldConfig
	| JsonInputFieldConfig
	| JsonImageFieldConfig;

/**
 * SnapForge 当前使用的 Blockly JSON block 子集。
 * 这层类型不追求覆盖 Blockly 全部字段，而是给项目里常用的 message/args/style/classes
 * 提供稳定约束，避免继续依赖上游过于宽泛的 `any`。
 */
export interface JsonBlockDefinition {
	type: string;
	message0: string;
	args0?: JsonFieldConfig[];
	output?: string | null;
	previousStatement?: string | null;
	nextStatement?: string | null;
	inputsInline?: boolean;
	style?: string;
	colour?: string;
	classes?: string | string[];
	tooltip?: string;
	helpUrl?: string;
}

export interface CreateBlockDefinitionOptions extends Omit<JsonBlockDefinition, "classes"> {
	classes?: string[];
}

/**
 * 统一补齐项目级基础 class，避免每个块都重复手写 `snapforge-block`。
 * 业务块只声明自己的语义类，例如 `snapforge-block--motor` / `--compact`。
 */
export function createBlockDefinition(options: CreateBlockDefinitionOptions): JsonBlockDefinition {
	const classes = ["snapforge-block", ...(options.classes ?? [])];
	return {
		...options,
		classes,
	};
}

/**
 * 统一走 Blockly 的 JSON 注册入口，section 文件里就不用重复直接调用
 * `defineBlocksWithJsonArray(...)` 了。
 */
export function registerJsonBlocks(Blockly: typeof BlocklyType, definitions: JsonBlockDefinition[]) {
	Blockly.defineBlocksWithJsonArray(
		definitions as Parameters<typeof BlocklyType.defineBlocksWithJsonArray>[0],
	);
}
