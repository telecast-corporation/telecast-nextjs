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