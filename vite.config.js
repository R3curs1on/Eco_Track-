import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'client',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(ROOT_DIR, 'client/index.html'),
        controlPanel: resolve(ROOT_DIR, 'client/control-panel.html'),
        simulation: resolve(ROOT_DIR, 'client/simulation.html')
      }
    }
  }
});
