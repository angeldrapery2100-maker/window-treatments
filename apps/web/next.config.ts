import type { NextConfig } from "next";

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '') || ''

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  transpilePackages: ["@window-treatments/shared"],
  serverExternalPackages: ["pg", "pg-pool", "pg-connection-string", "stripe"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.carolefabrics.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    if (!CDN_URL) return []
    // Rewrite all public asset folders to R2 CDN
    const assetFolders = [
      'hunter-douglas',
      'uploads',
      'videos',
      'drapery',
      'roman-shade',
      'top-treatments',
      'roller-collection',
      'sheer-collection',
      'luma-collection',
      'lutron',
      'about',
    ]
    return assetFolders.map(folder => ({
      source: `/${folder}/:path*`,
      destination: `${CDN_URL}/${folder}/:path*`,
    }))
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
