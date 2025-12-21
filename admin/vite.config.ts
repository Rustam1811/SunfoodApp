import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const repoRoot = path.resolve(__dirname, '..');
  loadEnv(mode, repoRoot, '');

  return {
    root: __dirname,
    base: '/admin/',
    envDir: repoRoot,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5174,
    },
    build: {
      outDir: path.resolve(repoRoot, 'dist', 'admin'),
      emptyOutDir: true,
    },
  };
});
