/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  outputFileTracingRoot: __dirname, // ✅ Moved from experimental
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.otaku-mori.com", // ✅ Adjust if needed
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, 
        path: false, 
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
