import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: false,      // exposes on network (equivalent to --host)
    strictPort: true // throws an error instead of trying the next available port
  }
})