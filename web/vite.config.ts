import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    // hmr: {
    //   clientPort: 80, // Use 80 for HTTP tunnels // 443 for HTTPS tunnels
    // },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    allowedHosts: true,
    // allowedHosts: ['deploychain.locci.cloud'], // Allow specific hosts
    // Or use true to allow all hosts
  },
}));
