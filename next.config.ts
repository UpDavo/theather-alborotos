import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100% estático (carpeta out/) para Cloudflare Pages.
  output: "export",
  devIndicators: false,
  // Permite abrir el dev server desde el iPad en la misma red.
  allowedDevOrigins: ["*.local", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
