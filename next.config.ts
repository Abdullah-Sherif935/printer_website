import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
