// Cấu hình Vite multi-page cho 3 trang: index, templates, app
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        templates: resolve(__dirname, 'templates.html'),
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
});
