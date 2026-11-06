/** @type {import('next').NextConfig} */

// Where the FastAPI backend lives. The browser only ever talks to /api/* on this site;
// Next proxies those calls to the backend, which keeps the login cookie first-party.
const API_URL = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

if (process.env.VERCEL && !process.env.API_URL) {
  // Fail the deploy loudly instead of shipping a site that can't reach its backend.
  throw new Error("API_URL is not set. In Vercel: Project Settings → Environment Variables → API_URL = your backend URL.");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Product / artisan photos and logos rarely change; let browsers and the CDN cache them for a week.
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
