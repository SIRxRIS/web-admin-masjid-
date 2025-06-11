import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Domain Google untuk foto profil
      },
      // Tambahkan domain lain jika diperlukan
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Wildcard untuk subdomain Google
      }
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;