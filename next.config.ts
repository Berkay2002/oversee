import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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

  // Configure MDX page extensions
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here if needed
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
