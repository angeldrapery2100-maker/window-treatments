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
    // ── Vercel Image Optimization disabled ──────────────────────────────────
    // This image-heavy site (full product catalogs + many photos) blew past the
    // Hobby plan's monthly image-optimization quota, after which /_next/image
    // returned HTTP 402 and images broke intermittently. With unoptimized,
    // <Image> renders a plain <img> pointing straight at the source (R2 via the
    // /media proxy and the asset-folder rewrites), so there is no per-image
    // Vercel transformation and no 402. Re-enable (remove this line) if/when the
    // project moves to a plan with a higher optimization limit, or an external
    // image CDN/loader is wired up.
    unoptimized: true,
    // Responsive breakpoints used to generate srcset for <Image>. Keeps phones
    // from downloading desktop-resolution photos.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Cache optimized variants at the edge for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
  // The A2P 10DLC sample messages link to angel-drapery.com/intake. That path
  // had no route (404). Point it at the consultation page, which carries the
  // verifiable SMS opt-in checkbox the carrier reviewer needs to see.
  async redirects() {
    return [
      { source: '/intake', destination: '/contact', permanent: false },
    ]
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
  // protections that aren't set by default.
  //
  // CSP is shipped in REPORT-ONLY mode first: it never blocks anything, it only
  // makes the browser log (and optionally report) what a real enforcing policy
  // WOULD block. Watch the browser console / reports for a week across the whole
  // site — especially checkout (Stripe) — then, once it's clean, flip the header
  // key to 'Content-Security-Policy' to enforce. Sources below cover Stripe,
  // the R2 media CDN, and Next/Tailwind/framer inline styles.
  async headers() {
    const R2 = 'https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev'
    const cspReportOnly = [
      `default-src 'self'`,
      // Next.js injects inline bootstrap scripts; Stripe.js is loaded for checkout.
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com`,
      // Tailwind / framer-motion / Next set inline styles.
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: ${R2} https://www.carolefabrics.com https://q.stripe.com`,
      `media-src 'self' blob: ${R2}`,
      `font-src 'self' data:`,
      // XHR/fetch to our APIs, Stripe, and the media CDN.
      `connect-src 'self' ${R2} https://api.stripe.com https://api.goshippo.com`,
      // Stripe payment element iframes.
      `frame-src https://js.stripe.com https://hooks.stripe.com`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'self'`,
    ].join('; ')

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
      // Report-only CSP — observe before enforcing (see comment above).
      { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
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
