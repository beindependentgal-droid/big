import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const buildTimestamp = new Date().toISOString();

export default defineConfig(() => {
  return {
    define: {
      "import.meta.env.VITE_BUILD_TIMESTAMP": JSON.stringify(buildTimestamp),
    },
    plugins: [react(), tailwindcss()],
    publicDir: path.resolve(__dirname, "public"),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("recharts")) return "charts";
              if (id.includes("lucide-react")) return "icons";
              if (id.includes("motion")) return "motion";
              if (id.includes("@tailwindcss") || id.includes("tailwindcss"))
                return "tailwind";
              return "vendor";
            }

            if (id.includes("/src/components/AdminDashboardView"))
              return "admin-dashboard";
            if (id.includes("/src/components/CommunityFeedsView"))
              return "community-feeds";
            if (id.includes("/src/components/DashboardView"))
              return "dashboard";
            if (id.includes("/src/components/MessagesView")) return "messages";
            if (id.includes("/src/components/BIGFundView")) return "big-fund";
            if (id.includes("/src/components/SettingsView")) return "settings";
            if (id.includes("/src/components/MySistersView"))
              return "my-sisters";
            if (id.includes("/src/components/ResourceLibraryView"))
              return "resource-library";
            if (id.includes("/src/components/")) return "app-components";
            if (id.includes("/src/lib/")) return "app-lib";
            if (id.includes("/src/api.ts")) return "app-api";
            if (id.includes("/src/data.ts")) return "app-data";
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled when DISABLE_HMR is true to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          secure: false,
          ws: false,
        },
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === "true"
          ? null
          : {
              ignored: [
                "**/public/images/**",
                "**/public/assets/images/**",
                "**/public/src/assets/images/**",
              ],
            },
    },
  };
});
