import * as Blockly from "blockly";
import { CATEGORIES } from "./categories";
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

interface CategoryToolbarProps {
	workspace: Blockly.WorkspaceSvg | null;
	activeCategory: string;
	onSelect: (name: string, source?: string) => void;
}

export function CategoryToolbar({ workspace, activeCategory, onSelect }: CategoryToolbarProps) {
	const handleClick = (name: string) => {
		if (!workspace) return;

		const toolbox = workspace.getToolbox() as any;
		if (!toolbox) return;

		// continuous-toolbox 点击分类应使用 setSelectedItem，
		// 才会触发 updateFlyout_ 并滚动到目标分类位置。
		const categoryItem = toolbox.getCategoryByName?.(name) ?? toolbox.getToolboxItemById?.(name) ?? null;
		console.log("[SnapForge][CategoryToolbar] click", {
			target: name,
			activeCategory,
			hasCategoryItem: Boolean(categoryItem),
			hasSetSelectedItem: typeof toolbox.setSelectedItem === "function",
		});
		if (categoryItem && typeof toolbox.setSelectedItem === "function") {
			toolbox.setSelectedItem(categoryItem);
		} else {
			// 最后降级：按索引选中
			const index = CATEGORIES.findIndex((c) => c.name === name);
			console.warn("[SnapForge][CategoryToolbar] fallback selectItemByPosition", { target: name, index });
			if (index >= 0) toolbox.selectItemByPosition?.(index);
		}

		onSelect(name, "toolbar-click");
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
