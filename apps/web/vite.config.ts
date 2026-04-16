import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/(?!@|src/|node_modules/|__vite|vite\\.svg$|favicon\\.ico$).+': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
