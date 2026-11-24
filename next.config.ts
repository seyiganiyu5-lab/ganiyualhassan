import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Where uploaded files live in production (Vercel Blob).
const BLOB = "https://*.public.blob.vercel-storage.com";

/**
 * Content Security Policy: the browser only loads scripts, styles, frames
 * and connections from the places listed here. 'unsafe-inline' scripts are
 * needed for Next.js' own bootstrapping and the intro's pre-paint script;
 * every other source is locked to this site.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `media-src 'self' blob: ${BLOB}`,
  `frame-src 'self' ${BLOB}`,
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  poweredByHeader: false,
  // Hide the floating Next.js dev indicator logo in the browser corner.
  devIndicators: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Keep the admin area and API out of search engines and caches.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
