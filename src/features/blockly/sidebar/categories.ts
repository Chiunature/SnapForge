export interface CategoryMeta {
	/** 与 toolbox.ts 中的 name 字段一致，用于 selectCategoryByName */
	name: string;
	/** 侧边栏显示文字 */
	label: string;
	/** 圆点颜色 */
	color: string;
}

export const CATEGORIES: CategoryMeta[] = [
	{ name: "事件", label: "事件", color: "#ffbf00" },
	{ name: "电机", label: "电机", color: "#4c97ff" },
	{ name: "灯光", label: "灯光", color: "#0fbd8c" },
	{ name: "声音", label: "声音", color: "#d65ac4" },
	{ name: "传感器", label: "传感器", color: "#5cb1d6" },
	{ name: "控制", label: "控制", color: "#ffab19" },
	{ name: "运算", label: "运算", color: "#f20d88" },
	{ name: "变量", label: "变量", color: "#0ff2a2" },
	{ name: "列表", label: "列表", color: "#8e2bed" },
];
