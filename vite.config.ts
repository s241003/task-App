import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({ registerType: 'autoUpdate',
     includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
     injectRegister: null,
     workbox: {
      navigateFallback: '/',
     },

     manifest: {
       name: 'PlaNavi-タスク管理アプリ',
       short_name: 'PlaNavi',
       description: 'タスク管理アプリ',
       theme_color: '#ffffff',

       // https://www.pwabuilder.com/imageGenerator
       icons: [
         {
           src: 'pwa-192x192.png',
           sizes: '192x192',
           type: 'image/png'
         },
         {
           src: 'pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png'
         },
         {
           src: 'pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'any'
         },
         {
           src: 'pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'maskable'
         }
       ]
     }
   })
  ]
})
