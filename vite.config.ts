import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
    server: {
      proxy: {
        '/api': {
          target: mode === 'development' ? 'http://localhost:3000' : 'https://coffee-addict.vercel.app',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api')
        }
      }
    }
  };
});
