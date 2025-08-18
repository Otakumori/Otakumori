/** @type {import('next').NextConfig} */
const nextConfig = {
  // safety net during build; real fix is dynamic rendering
  staticPageGenerationTimeout: 120,
  experimental: { ppr: true }, // optional streaming where helpful
};
export default nextConfig;
