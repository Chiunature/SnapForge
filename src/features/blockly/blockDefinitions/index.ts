/**
 * 积木定义包入口：供 `blocks.ts` 等外部只 import 目录即可，避免部分工具链对深层路径解析不稳定。
 */
export { registerBlocklyBlocks } from "./registerBlocklyBlocks";
