import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Following Vercel Multi Zones guide - basePath matches the rewrite path
  basePath: "/app",
  transpilePackages: [
    "@turbotemplate/i18n",
    "@turbotemplate/backend",
    "@turbotemplate/ui",
  ],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default createNextIntlPlugin()(nextConfig);
