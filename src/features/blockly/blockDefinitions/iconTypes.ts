export interface IconSpec {
	// 图标资源（建议使用打包器可处理的路径，和 Vite/Electron 的 import 搭配）
	src: string;
	width: number;
	height: number;
	alt?: string;
}

