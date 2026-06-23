import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ── Dev Server ────────────────────────────────────────────────────────────
  server: {
    proxy: {
      "/api": {
        target: "https://nub-adex.runasp.net",
        changeOrigin: true,
        // Strip Secure flag & relax SameSite so cookies work on http://localhost
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookies = proxyRes.headers["set-cookie"];
            if (setCookies) {
              proxyRes.headers["set-cookie"] = setCookies.map((cookie) =>
                cookie
                  .replace(/domain=[^;]+/gi, "domain=localhost")
                  .replace(/path=\/api\/Auth/gi, "path=/")
                  .replace(/;\s*secure/gi, "")
                  .replace(/samesite=strict/gi, "samesite=lax")
              );
            }
          });
        },
      },
    },
  },

  // ── Production Build ──────────────────────────────────────────────────────
  build: {
    // Split vendor chunks to improve caching and reduce main bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-pdf": ["jspdf", "html2canvas", "html2pdf.js", "html-to-image"],
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          "vendor-ui": ["radix-ui", "lucide-react", "clsx", "class-variance-authority", "tailwind-merge"],
        },
      },
    },
    // Remove console.log and debugger statements in production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
