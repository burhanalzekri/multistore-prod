import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    inlineCss: true,
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
