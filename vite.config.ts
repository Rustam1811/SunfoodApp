import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Явно грузим env, чтобы Vite подхватил VITE_* из .env/.env.local
  loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/app/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        scope: '/app/',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/app/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/admin/],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'firebase-storage-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-512x512.png'],
        manifest: {
          name: 'RauanaGym',
          short_name: 'RauanaGym',
          description: 'RauanaGym - Персональные тренировки',
          theme_color: '#10B981',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/app/',
          start_url: '/app/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    // Vite автоматически подхватывает VITE_* переменные из .env файлов
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    resolve: {
      dedupe: ['swiper'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@theme': path.resolve(__dirname, 'src/theme'),
        '@contexts': path.resolve(__dirname, 'src/contexts')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (p) => p, // keep path as-is, e.g., /api/promo
          ws: false
        },
        '/firebase-api': {
          target: 'https://us-central1-gym-vantero.cloudfunctions.net',
          changeOrigin: true,
          secure: true,
          ws: false,
          rewrite: (path) => path.replace(/^\/firebase-api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err) => {
              console.error('Firebase proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('🔄 Proxying to Firebase:', req.method, req.url, '→', options.target + req.url.replace('/firebase-api', ''));
            });
          },
        },
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'credentialless'
      }
    },
    build: {
      outDir: "dist/app",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Разделяем vendor код
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'ui-vendor': ['framer-motion', '@heroicons/react'],
            'i18n': ['i18next', 'react-i18next'],
          },
        },
      },
      // Оптимизация chunk size
      chunkSizeWarningLimit: 1000,
      // Минимизация CSS
      cssCodeSplit: true,
      // Source maps только для production debugging
      sourcemap: false,
      // Минификация
      minify: 'esbuild',
      target: 'es2015',
    },
    // Оптимизация dev сервера
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'i18next',
        'react-i18next',
        'firebase/app',
        'firebase/firestore',
        'firebase/storage',
        'firebase/messaging',
        'firebase/analytics',
      ],
    },
  };
});
