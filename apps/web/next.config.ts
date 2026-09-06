import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: ["@turbotemplate/i18n", "@turbotemplate/ui"],
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Vary", value: "Accept-Language, Cookie" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  async rewrites() {
    const APP_ORIGIN = process.env.APP_ORIGIN ?? "";
    return [
      // Rewrite app routes - following Vercel Multi Zones guide pattern
      { source: "/app", destination: `${APP_ORIGIN}/app` },
      { source: "/app/:path*", destination: `${APP_ORIGIN}/app/:path*` },
    ];
  },
};

export default createNextIntlPlugin()(nextConfig);
