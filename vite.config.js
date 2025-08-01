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
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, options) => {
                        proxy.on('error', (err, req, res) => {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            console.log('Proxying', req.method, req.url, 'to', options.target + req.url);
                        });
                    }
                },
                '/firebase-api': {
                    target: 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net',
                    changeOrigin: true,
                    secure: true,
                    ws: false,
                    rewrite: (path) => path.replace(/^\/firebase-api/, ''),
                    configure: (proxy, options) => {
                        proxy.on('error', (err, req, res) => {
                            console.error('Firebase proxy error:', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            console.log('🔄 Proxying to Firebase:', req.method, req.url, '→', options.target + req.url.replace('/firebase-api', ''));
                        });
                        proxy.on('proxyRes', (proxyRes, req, res) => {
                            console.log('✅ Firebase response:', proxyRes.statusCode, 'for', req.url);
                        });
                    }
                }
            }
        }
    };
});
