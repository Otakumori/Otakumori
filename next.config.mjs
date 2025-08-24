/** @type {import('next').NextConfig} */
const nextConfig = {
  // safety net during build; real fix is dynamic rendering
  staticPageGenerationTimeout: 120,
  experimental: { ppr: true }, // optional streaming where helpful
  
  // Clerk proxy configuration
  async rewrites() {
    return [
      {
        source: '/clerk/:path*',
        destination: 'https://clerk.otaku-mori.com/:path*',
      },
    ];
  },
};
export default nextConfig;
