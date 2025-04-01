import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("🧪 BACKEND_URL:", env.VITE_BACKEND_URL);

  return {
    plugins: [react()],
    base: '/',
    define: {
      'process.env': env
    }
  };
});
