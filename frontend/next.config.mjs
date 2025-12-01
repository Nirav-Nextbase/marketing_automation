/** @type {import('next').NextConfig} */
const nextConfig = {
  // WHY: Image optimization for better SEO and performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // WHY: Performance optimizations for better Core Web Vitals (SEO ranking factor)
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // WHY: Compression for better page speed (SEO ranking factor)
  compress: true,
  // WHY: PoweredBy header removal for security and cleaner headers
  poweredByHeader: false,
  // WHY: React strict mode for better development and production
  reactStrictMode: true,
  // WHY: Generate static pages where possible for better SEO
  output: 'standalone',
};

export default nextConfig;

