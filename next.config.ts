/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your actual config options here
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-image-domain.com'], // replace with actual domain if needed
  },
};

module.exports = nextConfig;
