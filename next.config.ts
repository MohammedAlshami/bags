import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// `npm run dev:local` swaps in local D1/R2 bindings (wrangler.local.jsonc) so dev never touches production.
if (process.env.LOCAL_CF === "1") {
  void initOpenNextCloudflareForDev({
    configPath: "wrangler.local.jsonc",
    persist: { path: ".wrangler/local-state/v3" },
  });
}

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const r2Patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Public R2 bucket: custom CDN domain + the legacy r2.dev host still referenced by older rows/orders.
  { protocol: "https", hostname: "cdn.goldqueen.store", port: "", pathname: "/**" },
  { protocol: "https", hostname: "pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev", port: "", pathname: "/**" },
];

const r2PublicUrl = process.env.R2_PUBLIC_URL;
if (r2PublicUrl) {
  try {
    const u = new URL(r2PublicUrl);
    r2Patterns.push({
      protocol: "https",
      hostname: u.hostname,
      port: "",
      pathname: "/**",
    });
  } catch {
    // Ignore invalid R2_PUBLIC_URL at build time.
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      { source: "/users", destination: "/profile", permanent: false },
      { source: "/collections", destination: "/shop", permanent: false },
      { source: "/collections/:path*", destination: "/shop", permanent: false },
      { source: "/admin/collections", destination: "/admin/products", permanent: false },
      { source: "/admin/collections/:path*", destination: "/admin/products", permanent: false },
      { source: "/admin/shipping", destination: "/admin/orders", permanent: false },
    ];
  },
  images: {
    // Pre-optimized uploads are served straight from storage; everything else uses /_next/image.
    loaderFile: "./lib/image-loader.ts",
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      ...r2Patterns,
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "behno.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sleek-theme-demo.myshopify.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "palo-alto-theme-main.myshopify.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "release-serenity.myshopify.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shine-sophisticated.myshopify.com",
        port: "",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "wonder-theme-beauty.myshopify.com",
        port: "",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        port: "",
        pathname: "/wiki/Special:FilePath/**",
      },
    ],
  },
};

export default nextConfig;
