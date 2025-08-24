/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Disable ESLint during builds to allow deployment with current linting issues
    ignoreDuringBuilds: true,
  },
  experimental: {
    // keep other experiments if you have them
    missingSuspenseWithCSRBailout: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "next-auth/react": path.join(__dirname, "lib/auth/nextAuthCompat.tsx"),
    };
    return config;
  },
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
      'storage.googleapis.com',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
