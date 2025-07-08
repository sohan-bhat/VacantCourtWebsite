import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePluginRadar } from 'vite-plugin-radar'; 

export default defineConfig({
  plugins: [
    react(),
    VitePluginRadar({
      analytics: process.env.VITE_GOOGLE_ANALYTICS_ID ? {
        id: process.env.VITE_GOOGLE_ANALYTICS_ID,
      } : undefined,
    })
  ],
});