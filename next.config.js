/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Moved outputFileTracingRoot outside experimental (as required)
  outputFileTracingRoot: __dirname,
  output: 'standalone', // Helps Vercel generate a clean output
  images: {
    // Use remotePatterns instead of deprecated images.domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks for Node built-in modules that are not available on the client
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false
      };
    }
    return config;
  }
};

module.exports = nextConfig;
