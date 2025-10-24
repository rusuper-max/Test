// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': ['public/portfolio/**'],
    },
  },
};

export default nextConfig;