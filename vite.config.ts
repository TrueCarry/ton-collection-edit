import { PluginOption, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

import { analyzer } from 'vite-bundle-analyzer'

const addAnalyzer: PluginOption[] = process.env.ANALYZE === '1' ? [analyzer()] : []

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ...addAnalyzer],
  server: {
    port: 3000,
  },
  base: '',
  optimizeDeps: {
    include: ['bn.js'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
})
