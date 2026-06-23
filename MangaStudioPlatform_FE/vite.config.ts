import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_API_BASE_URL?.replace(/\/$/, "");

  return {
    plugins: [react()],
    server: backendUrl
      ? {
          proxy: {
            "/api": {
              target: backendUrl,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
  };
});
