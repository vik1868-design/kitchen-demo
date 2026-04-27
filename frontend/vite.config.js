import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // In production (Docker) the frontend is served by nginx and
  // proxies /api/* to the Express container.
  // VITE_API_URL is injected at build time via ARG in Dockerfile.
});
