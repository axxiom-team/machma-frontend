import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',       // For demo images
      'source.unsplash.com',       // For random placeholder images
      'picsum.photos',             // Alternative placeholder service
      'via.placeholder.com',        // Another placeholder service
      'storage.googleapis.com'
    ],
    // Or use the more secure remotePatterns:
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
  }
};

export default nextConfig;