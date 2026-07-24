import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { printDevEntryUrls } from './vite-plugins/print-dev-entry-urls';

const gameId = '{{gameId}}';

export default defineConfig({
  plugins: [vue(), printDevEntryUrls(gameId)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.VITE_GAME_ID': JSON.stringify(gameId),
  },
  base: './',
  build: {
    target: 'es2018',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL(`games/${gameId}/app-index.html`, import.meta.url)),
        preview: fileURLToPath(new URL('preview/preview-index.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
