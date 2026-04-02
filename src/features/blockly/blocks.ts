// 积木注册入口（对外保持不变）
// 实际的积木定义已经拆分到 `blockDefinitions/` 下按分类组织，避免单文件堆积。
import { registerBlocklyBlocks } from "./blockDefinitions/registerBlocklyBlocks";

export { registerBlocklyBlocks };
