import createNextIntl from 'next-intl/plugin'

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import( './src/env.js' )

/** @type {import("next").NextConfig} */
const config = createNextIntl()( {
  webpack: ( config ) => {
    config.resolve.alias.canvas = false
    return config
  },
  experimental: {
    optimizePackageImports: [ '@mantine/core', '@mantine/hooks' ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      // Localhost
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Localhost
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/**',
      },
    ],
  },
} )

export default config