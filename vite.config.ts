import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.png', 'robots.txt', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Wandr — AI Travel Intelligence Platform',
        short_name: 'Wandr',
        description:
          'Can you legally go there? What visa do you qualify for? Can you afford to live there? Wandr is your AI-powered travel intelligence platform.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#F5EFE0',
        background_color: '#F5EFE0',
        categories: ['travel', 'productivity', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          { name: 'AI Assistant', short_name: 'Assistant', url: '/assistant' },
          { name: 'Travel Planner', short_name: 'Planner', url: '/travel-planner' },
          { name: 'My Dashboard', short_name: 'Dashboard', url: '/dashboard' },
        ],
      },
      workbox: {
        // Precache the whole shell (JS/CSS/HTML/fonts/icons) so every route
        // resolves instantly offline, including saved guides & itineraries UI.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        globIgnores: ['**/og-image.png', '**/itinerary-*.html'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // SPA fallback, but never hijack serverless/API navigation.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/\.netlify\//, /^\/(?:manifest\.webmanifest|sw\.js)$/],
        runtimeCaching: [
          {
            // API + dynamic data: try network first (works offline when cached),
            // fall back to cache after a short timeout.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/functions/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wandr-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Static images, flags, icons, map tiles: cache-first, long-lived.
            urlPattern: ({ url }) =>
              /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'wandr-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts binary files (fonts.gstatic.com) — immutable.
            urlPattern: ({ url }) => url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'wandr-google-fonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet (CSS) — cheap to revalidate.
            urlPattern: ({ url }) => url.hostname === 'fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wandr-google-fonts-css',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Third-party images (Unsplash guides/country photos): cache-first.
            urlPattern: ({ url }) => url.hostname.endsWith('images.unsplash.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'wandr-unsplash',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Currency + weather feeds: network-first with same-day cache.
            urlPattern: ({ url }) =>
              url.hostname === 'open.er-api.com' ||
              url.hostname === 'api.frankfurter.app' ||
              url.hostname === 'api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wandr-live-data',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 12 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
        },
      },
    },
  },
});
