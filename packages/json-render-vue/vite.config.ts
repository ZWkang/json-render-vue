import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// 写一个 vite vue 包的配置文件
export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'json-render-vue',
      fileName: 'json-render-vue',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'monaco-editor'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
