import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'https://api-lcc.onrender.com', changeOrigin: true },
      '/uploads': { target: 'https://api-lcc.onrender.com', changeOrigin: true },
      '/socket.io': { target: 'https://api-lcc.onrender.com', ws: true, changeOrigin: true },
      '/jaas': { target: 'https://api-lcc.onrender.com/', changeOrigin: true, ws: true },
    },
  },
})
