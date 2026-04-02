export type DropdownOption = [label: string, value: string];

// “插槽/字段”描述：用于生成 Blockly Field（下拉、数字、图片等）。
// 你之后如果要支持更多字段类型，只需要在这里扩展接口/类型即可。
export interface DropdownSlotSpec {
	fieldName: string;
	options: DropdownOption[];
}

export interface NumberSlotSpec {
	fieldName: string;
	defaultValue: number;
	min?: number;
	max?: number;
	precision?: number;
}

