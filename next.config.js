/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable Turbopack optimizations
  experimental: {
    turbo: {
      rules: {
        // Configure Turbopack rules
        '*.{js,jsx,ts,tsx}': ['swc'],
      },
    },
  },
};

module.exports = nextConfig; 