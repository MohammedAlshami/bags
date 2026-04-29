import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const r2Patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

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
