import type { NextConfig } from 'next';

const isLandingBuild = process.env.NEXT_LANDING_ONLY === 'true';

const nextConfig: NextConfig = isLandingBuild
  ? {
      output: 'export',
      basePath: '/VoteInfoFrance',
      assetPrefix: '/VoteInfoFrance/',
      trailingSlash: true,
      distDir: 'out-landing',
      images: { unoptimized: true },
    }
  : {
      transpilePackages: ['@vif/ui', '@vif/types'],
    };

export default nextConfig;
