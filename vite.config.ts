import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/steam-api": {
        target: "https://api.steampowered.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("recharts")) return "recharts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("emoji-picker-react")) return "emoji";
          // React permanece no chunk padrão para evitar dependência circular
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "logo-nexus.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      workbox: {
        // Bundle principal ainda pode passar de 2 MiB; evita falha no generateSW
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/steam-api/],
      },
      manifest: {
        id: "/",
        name: "Nexus",
        short_name: "Nexus",
        description: "A comunidade tech do Nexus no seu celular, com ícone na tela inicial.",
        theme_color: "#00C6FF",
        background_color: "#0a0c14",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/comunidade",
        scope: "/",
        lang: "pt-BR",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
