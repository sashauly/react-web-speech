import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g., 'development', 'production')
  // By default, `loadEnv` will load .env files
  const env = loadEnv(mode, process.cwd(), "");

  // Get the base path from an environment variable, defaulting to '/'
  // Ensure your CI/CD sets VITE_BASE_URL to '/<REPO>/'
  const BASE_URL = env.VITE_BASE_URL || "/";
  return {
    base: BASE_URL,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
