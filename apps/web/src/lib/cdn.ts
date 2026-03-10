/**
 * CDN base URL for static assets (product images, etc.)
 * In production, points to Cloudflare R2 public URL.
 * In development, serves from Next.js public/ folder (empty string).
 */
export const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '') || ''
