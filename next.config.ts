 import type { NextConfig } from "next";


 const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];


const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // 🌅 Imágenes base
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },

      // 🔥 Firebase Storage (tu caso actual)
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },

      // 🌍 Aliados / fuentes externas (GYG, Viator, Trip.com)
      { protocol: "https", hostname: "cdn.getyourguide.com" },
      { protocol: "https", hostname: "media.tacdn.com" }, // TripAdvisor
      { protocol: "https", hostname: "viator.com" },
      { protocol: "https", hostname: "static.trip.com" },
       { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  experimental: {
    optimizeCss: true,
    reactCompiler: true,
  },

  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  
 

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
