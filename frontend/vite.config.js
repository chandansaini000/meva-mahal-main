import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Avoid localhost resolving to ::1 when the API listens on IPv4.
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
