import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/identity': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/identity/, ''),
      },
      '/submission': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/submission/, ''),
      },
      '/series': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/series/, ''),
      },
      '/chapter': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chapter/, ''),
      },
      '/task': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/task/, ''),
      },
      '/qa': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qa/, ''),
      },
      '/publishing': {
        target: 'http://localhost:5007',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/publishing/, ''),
      },
      '/ranking': {
        target: 'http://localhost:5008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ranking/, ''),
      },
    },
  },
})
