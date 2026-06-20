import type { NextConfig } from 'next';
import path from 'path';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude native Node.js modules from Edge Runtime and client bundling
  // (moved from experimental.serverComponentsExternalPackages in Next.js 15)
  serverExternalPackages: ['bcrypt', 'pg', 'pg-native', '@mapbox/node-pre-gyp'],
  // Suppress webpack warnings for optional native dependencies
  webpack: (config) => {
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('pg-native');
    }
    // Redirect deprecated Node.js built-in punycode to the userland package (DEP0040)
    // uri-js (via ajv) requires the built-in; this alias routes it to punycode@2.x instead
    config.resolve.alias = {
      ...(config.resolve.alias as object),
      punycode: path.resolve('./node_modules/punycode'),
    };
    return config;
  },
};

export default nextConfig;
