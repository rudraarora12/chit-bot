import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  // React's CommonJS entry checks this Node-style variable. Content scripts run
  // in the browser, where `process` does not exist, so replace it at build time.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(currentDirectory, 'src/content.tsx'),
      formats: ['iife'],
      name: 'ChitLedgerCollectionAssistant',
      fileName: () => 'content.js',
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
