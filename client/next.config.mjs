/** @type {import('next').NextConfig} */
const nextConfig = {
  // Windows / dev: webpack fayl keshi ba’zan eski chunk ID lar bilan `/_next/static/...` 404 va MODULE_NOT_FOUND beradi.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
