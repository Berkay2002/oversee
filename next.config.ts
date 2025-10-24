import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR)
  cacheComponents: true,

  // React Compiler for automatic memoization (Next.js 16)
  reactCompiler: true,

  // Image optimization defaults (Next.js 16 updated defaults)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hzowvejjmnamhnrbqpou.supabase.co',
      },
    ],
  },
};

export default nextConfig;
