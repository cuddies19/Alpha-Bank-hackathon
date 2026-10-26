import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // API бэкенда (docker compose: сервис api на 8000). Пока фронт работает на моках — прокси на будущее.
    proxy: { '/api': { target: 'http://localhost:8000', rewrite: (path) => path.replace(/^\/api/, '') } },
  },
});
