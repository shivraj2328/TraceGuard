import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    proxy: {
      // Intercept any request starting with "/api"
      '/api': {
        target: 'http://localhost:5000/api', // Your backend server URL
        changeOrigin: true,             // Changes the origin of the host header to the target URL
        secure: false,                  // Set to false if you are using self-signed SSL certificates
        rewrite: (path) => path.replace(/^\/api/, ''), // Strips "/api" from the request path before sending to backend
      },
    },
  },
})
