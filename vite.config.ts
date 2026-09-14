import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Hosting note (Vercel / Cloudflare): also set response headers on admin.* :
 *   X-Robots-Tag: noindex, nofollow
 *   X-Frame-Options: DENY
 *   X-Content-Type-Options: nosniff
 *   Referrer-Policy: strict-origin-when-cross-origin
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5175 },
  preview: {
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
});
