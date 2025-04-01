import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist'
    },
    define: {
      'process.env': env // если нужно
    }
  };
});
