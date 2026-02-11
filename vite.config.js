import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : '/dungeons-dragons-app/';

  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icons/icon.svg',
          'icons/*.png',
          'img/*.{png,jpg,jpeg,webp}',
          'icons/*.mp3'
        ],
        manifest: {
          name: 'D&D - Gestionale Personaggi',
          short_name: 'D&D Personaggi',
          description: 'Tablet-first D&D character manager',
          theme_color: '#6f4e37',
          background_color: '#f6f1e7',
          display: 'standalone',
          start_url: './#/',
          icons: [
            {
              src: './icons/logo_dd.png',
              sizes: '500x500',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ]
  };
});
