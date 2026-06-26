import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the floating Next.js dev indicator logo in the browser corner.
  devIndicators: false,
  // Allow the sandbox preview panel (and other preview origins) to load
  // Next.js dev assets (/_next/*) without being blocked by CORS.
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.preview.z.ai",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
