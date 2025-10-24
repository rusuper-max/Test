/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // najjednostavnije
    domains: ["res.cloudinary.com"],

    // i preko remotePatterns (nije nužno, ali nek stoji)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],

    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;