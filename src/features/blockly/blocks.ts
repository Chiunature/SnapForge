// 积木注册入口（对外保持不变）
// 实际的积木定义已经拆分到 `blockDefinitions/` 下按分类组织，避免单文件堆积。
// 从目录导入（走 `blockDefinitions/index.ts`），减少 IDE 报「找不到模块」的情况。
import { registerBlocklyBlocks } from "./blockDefinitions";

export { registerBlocklyBlocks };
