import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/* will be forwarded…
      '/api': {
        target: 'https://www.pokemonpricetracker.com',
        changeOrigin: true,
        secure: true,
        // Rewrites /api/v1/prices → /api/v1/prices
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
})
