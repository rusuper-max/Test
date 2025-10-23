/** @type {import('next').NextConfig} */
const nextConfig = {
  // Recite Next-u koji je stvarni root (gasi onaj warning sa više lockfile-ova)
  turbopack: {
    root: __dirname,
  },
  // Nemoj rušiti build zbog ESLint-a
  eslint: {
    ignoreDuringBuilds: true,
  },
  // (opciono) Ako ti TypeScript prijavljuje greške koje ne želiš da blokiraju build:
  // typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;