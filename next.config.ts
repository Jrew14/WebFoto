import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['postgres', 'drizzle-orm'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        perf_hooks: false,
        os: false,
        crypto: false,
      };
      
      // Exclude server-only packages from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'postgres': 'commonjs postgres',
        'drizzle-orm': 'commonjs drizzle-orm',
      });
    }
    return config;
  },
};

export default nextConfig;
