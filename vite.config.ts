import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { errorPagePlugin } from "./src/plugins/errorPagePlugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), errorPagePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
