import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@window-treatments/shared"],
  serverExternalPackages: ["pg", "pg-pool", "pg-connection-string", "stripe"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.carolefabrics.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't try to bundle pg on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        'pg-native': false,
      };
    }
    return config;
  },
};

export default nextConfig;
