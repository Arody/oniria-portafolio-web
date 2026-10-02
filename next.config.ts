import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/api/icon', permanent: true }];
  },
};

export default nextConfig;
