import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 生产加载时 Electron 用本地文件系统，尽量使用相对路径。
  base: './',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'renderer/dist',
    emptyOutDir: true,
  },
})
