/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configure API routes to handle larger file uploads
  serverExternalPackages: ['@prisma/client'],
  // Temporarily disable Turbopack to fix bootstrap issues
  // experimental: {
  //   turbo: {
  //     rules: {
  //       // Configure Turbopack rules
  //       '*.{js,jsx,ts,tsx}': ['swc'],
  //     },
  //   },
  // },
};

module.exports = nextConfig;