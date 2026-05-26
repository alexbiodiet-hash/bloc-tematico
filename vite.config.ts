import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Bloc Temático',
        short_name: 'Bloc',
        description: 'Notas, números y alarmas por temáticas',
        theme_color: '#4f46e5',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cachea la shell de la app para que cargue rápido
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Las peticiones a Supabase siempre van a la red primero
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  // base './' es imprescindible para que Electron cargue assets con file://
  base: './',
  server: {
    port: 5273,
  },
})
