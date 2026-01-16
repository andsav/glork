import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../dist-react',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tsp: resolve(__dirname, 'tsp.html'),
        clustering: resolve(__dirname, 'clustering.html'),
        notes: resolve(__dirname, 'notes.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/go.glork.net': {
        target: 'http://go.glork.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/go\.glork\.net/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
