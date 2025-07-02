/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL || "http://localhost:8000",
    },
    images: {
        domains: ["localhost"],
    },
};

module.exports = nextConfig;
