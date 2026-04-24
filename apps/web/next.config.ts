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
  // ── Security headers ──────────────────────────────────────────────────────
  // Applied to every response the app origin emits. HSTS is already injected
  // by Vercel's edge; we layer on the MIME, framing, referrer and permissions
  // protections that aren't set by default. No CSP yet — Stripe / Resend /
  // framer-motion inline styles would each need a targeted source entry and
  // a mis-tuned CSP breaks checkout silently. Left as a follow-up.
  async headers() {
    const securityHeaders = [
      // Prevent MIME-sniffing uploaded files into executable content
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Block clickjacking by same-origin-only framing
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Do not leak full URLs (query strings, order numbers, etc.) to third
      // parties; preserve the host for same-origin analytics.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Deny powerful browser APIs the app never uses. Narrow the list when
      // a feature legitimately needs one of these.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
      },
    ]
    return [
      { source: '/:path*', headers: securityHeaders },
    ]
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
