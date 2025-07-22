import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 80, // Change this to your desired port
    strictPort: true, // Optional: prevents fallback to another port
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
