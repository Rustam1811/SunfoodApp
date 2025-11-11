import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    base: '/',
    define: {
      'import.meta.env': env
    },
    resolve: {
      dedupe: ['swiper'],
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://coffee-addict.vercel.app',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api') // сохраняем путь
        }
      }
    }
  };
});
