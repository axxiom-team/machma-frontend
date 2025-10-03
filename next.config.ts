import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'storage.googleapis.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.picsum.photos',
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip lint errors during Vercel builds
  }
};

export default nextConfig;
