import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',
  output: 'standalone',
  serverExternalPackages: ['googleapis'],
};

export default nextConfig;
