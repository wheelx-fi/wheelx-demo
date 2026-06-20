import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: process.env.BUILD_OUTPUT_DIR,
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
};

export default nextConfig;
