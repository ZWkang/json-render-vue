import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TDesignVueNext',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'tdesign-vue-next', 'json-render-vue', '@json-render/core'],
      output: {
        globals: {
          vue: 'Vue',
          'tdesign-vue-next': 'TDesign',
        },
      },
    },
  },
})
