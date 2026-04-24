import { create } from "zustand";
import type * as Blockly from "blockly";

type ManualSelectLock = {
	name: string;
	until: number;
};

type BlocklyUiState = {
	/** 是否正在运行作品 */
	isRunning: boolean;
	/** 当前高亮的积木分类名，空字符串表示无选中 */
	activeCategory: string;
	/** Blockly 工作区实例，inject 后写入，dispose 后清空 */
	workspace: Blockly.WorkspaceSvg | null;
	/**
	 * 防抖锁：手动点击分类后短时间内忽略 Blockly 内部的 selectCategoryByName 回调，
	 * 避免滚动动画过程中侧边栏高亮反复跳动。
	 * 注意：这是一个「写多读多」的瞬态值，不会触发 React 重新渲染（用 ref 代替更合理），
	 * 因此直接放在 store 的普通 JS 字段中而非响应式 state。
	 */
	_manualSelectLock: ManualSelectLock | null;

	setRunning: (running: boolean) => void;
	setActiveCategory: (name: string) => void;
	setWorkspace: (ws: Blockly.WorkspaceSvg | null) => void;
	setManualSelectLock: (lock: ManualSelectLock | null) => void;
	/** 卸载工作区时一次性重置 UI 状态 */
	resetUi: () => void;
};

export const useBlocklyUiStore = create<BlocklyUiState>((set) => ({
	isRunning: false,
	activeCategory: "",
	workspace: null,
	_manualSelectLock: null,

	setRunning: (running) => set({ isRunning: running }),
	setActiveCategory: (name) => set({ activeCategory: name }),
	setWorkspace: (ws) => set({ workspace: ws }),
	setManualSelectLock: (lock) => set({ _manualSelectLock: lock }),
	resetUi: () =>
		set({
			isRunning: false,
			activeCategory: "",
			workspace: null,
			_manualSelectLock: null,
		}),
}));

/** 在非 React 环境（如 Blockly 事件回调）里直接读写 store，不触发 re-render */
export const getBlocklyUiStore = () => useBlocklyUiStore.getState();
