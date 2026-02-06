import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    proxy: {
      "/translate_a": {
        target: "https://translate.googleapis.com",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
