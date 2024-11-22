import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the service worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Preloaded assets
      manifest: {
        name: 'LaSo',
        short_name: 'LaSo',
        description: 'An app that enables real-time translated chat between users of different languages.',
        icons: [
          {
            src: '/web/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/web/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/web/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/web/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        theme_color: '#ffffff', // Matches the theme
        background_color: '#ffffff', // Splash screen background
        display: 'standalone', // Runs without browser UI
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        lang: 'en', // Sets the default language
      },
      devOptions: {
        enabled: true, // PWA testing enabled in development
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL, // Environment variable for API
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Allows using "@/..." as shorthand for "./src/..."
    },
  },
});
