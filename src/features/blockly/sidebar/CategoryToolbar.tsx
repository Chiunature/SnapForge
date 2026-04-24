import * as Blockly from "blockly";
import { CATEGORIES } from "./categories";
import { getBlocklyUiStore, useBlocklyUiStore } from "../store/useBlocklyUiStore";
import icon1 from "../../../assets/icon/toolbox-1.svg";
import icon2 from "../../../assets/icon/toolbox-2.svg";
import icon3 from "../../../assets/icon/toolbox-3.svg";
import icon4 from "../../../assets/icon/toolbox-4.svg";
import icon5 from "../../../assets/icon/toolbox-5.svg";
import icon6 from "../../../assets/icon/toolbox-6.svg";
import icon7 from "../../../assets/icon/toolbox-7.svg";
import icon8 from "../../../assets/icon/toolbox-8.svg";
import icon9 from "../../../assets/icon/toolbox-9.svg";

const icons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9];

export function CategoryToolbar() {
	// 直接从 store 读取，不再依赖父组件 props 传递
	const workspace = useBlocklyUiStore((s) => s.workspace);
	const activeCategory = useBlocklyUiStore((s) => s.activeCategory);

	const handleClick = (name: string) => {
		if (!workspace) return;

		const toolbox = workspace.getToolbox() as any;
		if (!toolbox) return;

		// 再次点击当前已选分类：取消选中并收起飞出栏
		if (name === activeCategory) {
			toolbox.getFlyout?.()?.hide?.();
			Blockly.svgResize(workspace);
			// 清空锁与选中状态
			getBlocklyUiStore().setManualSelectLock(null);
			getBlocklyUiStore().setActiveCategory("");
			return;
		}

		// 通知父组件（BlocklyWorkspace）设置手动选择锁
		getBlocklyUiStore().setManualSelectLock({ name, until: Date.now() + 450 });

		// 获取到分类项
		const categoryItem = toolbox.getCategoryByName?.(name) ?? toolbox.getToolboxItemById?.(name) ?? null;
		if (categoryItem && typeof toolbox.setSelectedItem === "function") {
			toolbox.setSelectedItem(categoryItem);
		} else {
			// 最后降级：按索引选中
			const index = CATEGORIES.findIndex((c) => c.name === name);
			console.warn("[SnapForge][CategoryToolbar] fallback selectItemByPosition", { target: name, index });
			if (index >= 0) toolbox.selectItemByPosition?.(index);
		}

		getBlocklyUiStore().setActiveCategory(name);
	};

	return (
		<div className="cat-toolbar">
			{CATEGORIES.map((cat, index) => (
				<button
					key={cat.name}
					type="button"
					className={`cat-item${activeCategory === cat.name ? " cat-item--active" : ""}`}
					style={{ ["--cat-color" as any]: cat.color }}
					onClick={() => handleClick(cat.name)}
				>
					<img src={icons[index]} alt={cat.label} className="cat-icon" />
					<span className="cat-label">{cat.label}</span>
				</button>
			))}
		</div>
	);
}
