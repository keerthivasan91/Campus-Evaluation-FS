import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const workspaceRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      axios: path.resolve(workspaceRoot, "notification-app-fe/src/shims/axios.js"),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: [workspaceRoot],
    },
  },
  preview: {
    port: 3000,
  },
})
