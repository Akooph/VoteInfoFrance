import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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

// Skip Sentry instrumentation for static landing builds (no server-side runtime)
export default isLandingBuild
  ? nextConfig
  : withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    });
