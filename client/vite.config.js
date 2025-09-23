import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 80, // Change this to your desired port
    strictPort: true, // Optional: prevents fallback to another port
    historyApiFallback: true, // Ensure React Router works with frontend routes
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    // This is important for SPA routing in preview mode
    historyApiFallback: true,
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
