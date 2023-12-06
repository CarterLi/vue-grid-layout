import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'VueGridLayout',
      fileName: format => `grid-layout.${format}.js`,
    },
    rollupOptions: {
      external: [
        'interactjs',
        'mitt',
        'resize-observer-polyfill',
        'tslib',
        'vue',
        /node_modules/
      ],
    },
  },
  plugins: [vue()],
});
