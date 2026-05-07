import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // @google/generative-ai is an optional peer dependency for the Gemini
      // AI provider path. It is not installed by default; builds that target
      // Google AI Studio will install it at deploy time.
      external: ['@google/generative-ai'],
    },
  },
})
