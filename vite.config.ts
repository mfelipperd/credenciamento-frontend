import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { errorPagePlugin } from "./src/plugins/errorPagePlugin";

import { version } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), errorPagePlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
