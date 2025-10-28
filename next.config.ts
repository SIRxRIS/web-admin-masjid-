import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Domain Google untuk foto profil
      },
      // Tambahkan domain lain jika diperlukan
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Wildcard untuk subdomain Google
      },
      // Tambahkan hostname Supabase untuk storage images
      {
        protocol: "https",
        hostname: "scszbqgumyvtbdlnebdq.supabase.co", // Supabase storage domain
        pathname: "/storage/v1/object/public/**", // Path untuk public storage
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  // Suppress extension-related errors
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;