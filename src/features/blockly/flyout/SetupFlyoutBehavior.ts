import * as Blockly from "blockly";

const FLYOUT_DEFAULT_MAX_WIDTH_PX = 240;

export const setupFlyoutBehavior = (workspace: Blockly.WorkspaceSvg): (() => void) | undefined => {
	const toolbox = workspace.getToolbox() as any; //调用工作区实例的方法，获取工具箱对象
	const flyout = toolbox?.getFlyout?.(); //调用工具箱对象的方法，获取飞出栏对象
	if (!flyout || (flyout as any).__snapforge_widthClamped) return; //如果飞出栏对象不存在或者已经被限制宽度，则返回

	const originalGetWidth = typeof flyout.getWidth === "function" ? flyout.getWidth.bind(flyout) : null; //让this指向永远绑定flyout对象，并且保存，避免其他变量调用不正确
	if (!originalGetWidth) return; //如果originalGetWidth不存在，则退出
	const widthLimit = FLYOUT_DEFAULT_MAX_WIDTH_PX;

	(flyout as any).__snapforge_widthClamped = true; //标记该方法已经执行过
	flyout.getWidth = () => Math.min(originalGetWidth(), widthLimit); //重写getWidth方法，调用原始方法获取原始宽度 → 与限制值比较 → 返回较小的那个

	/*
    鼠标事件监听
    */
	const setupMouseEvents = () => {
		const flyoutSvg = document.querySelector(".blocklyFlyout.blocklyToolboxFlyout") as HTMLElement | null;
		if (!flyoutSvg) {
			console.log("未找到flyoutSvg元素");
			return false;
		}
		if ((flyoutSvg as any).__snapforge_mouseEventsAttached) return true; //如果已经添加了鼠标事件，则返回true
		(flyoutSvg as any).__snapforge_mouseEventsAttached = true; //标记定义鼠标事件
		//鼠标事件函数
		const handleMouseEnter = (e: MouseEvent) => {
			console.log("鼠标进入飞出栏");
			flyoutSvg.style.overflow = "visible";
		};
		const handleMouseLeave = (e: MouseEvent) => {
			console.log("鼠标离开飞出栏");
			flyoutSvg.style.overflow = "hidden";
		};
		//添加鼠标事件
		flyoutSvg.addEventListener("mouseenter", handleMouseEnter);
		flyoutSvg.addEventListener("mouseleave", handleMouseLeave);
		(flyoutSvg as any).__snapforge_mouseHandlers = { handleMouseEnter, handleMouseLeave }; //添加私有属性用来保存鼠标事件函数,方便后续清理

		return true;
	};
	//先立即绑定，如果绑定失败，等dom来
	if (!setupMouseEvents()) {
		const observer = new MutationObserver(() => {
			//再次绑定，如果成功，则停止观察
			if (setupMouseEvents()) {
				observer.disconnect();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
		(flyout as any).__snapforge_observer = observer;
	}
	//返回清理函数
	return () => {
		// 清理宽度限制标记
		(flyout as any).__snapforge_widthClamped = false;
		// 清理鼠标事件监听
		const flyoutSvg = document.querySelector(".blocklyFlyout.blocklyToolboxFlyout") as HTMLElement | null;
		const handlers = (flyoutSvg as any).__snapforge_mouseHandlers;
		if (flyoutSvg && handlers) {
			flyoutSvg.removeEventListener("mouseenter", handlers.handleMouseEnter);
			flyoutSvg.removeEventListener("mouseleave", handlers.handleMouseLeave);
			delete (flyoutSvg as any).__snapforge_mouseHandlers;
			delete (flyoutSvg as any).__snapforge_mouseEventsAttached;
		}
		// 清理观察者
		const observer = (flyout as any).__snapforge_observer;
		if (observer) {
			observer.disconnect();
			delete (flyout as any).__snapforge_observer;
		}
	};
};
