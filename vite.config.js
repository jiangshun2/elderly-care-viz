import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const varsFile = path.resolve(root, 'src/styles/variables.scss')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // .vue 单文件组件的 <style lang="scss"> 自动注入设计变量，避免逐个手写 @use
        additionalData: (source, filename) => {
          if (!filename || !filename.includes('.vue')) return source
          const clean = filename.split('?')[0]
          const rel = path.relative(path.dirname(clean), varsFile).split(path.sep).join('/')
          return `@use "${rel}" as *;\n${source}`
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500
  }
})
