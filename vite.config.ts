import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // <-- 1. PWA import ကို ဤနေရာတွင် ထပ်ဖြည့်ပါ

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // <-- 2. သင်၏ မူလ react() plugin

    // 3. ဤ PWA block တစ်ခုလုံးကို React plugin ၏ 'အောက်' တွင် ထပ်ဖြည့်ပါ
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Textile Factory ERP',
        short_name: 'Factory ERP',
        description: 'Piece-Rate Tracker for Textile Mills',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // ဤဖိုင်ကို public folder ထဲ ထည့်ရန် လိုပါမည်
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // ဤဖိုင်ကို public folder ထဲ ထည့်ရန် လိုပါမည်
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  // 4. သင်၏ မူလ server setting ကို မပျက်စီးအောင် ဤနေရာတွင် ထားရှိပါ
  server: { 
    port: 5174 
  }, 
})