import type { NextConfig } from 'next';

// GitHub Pages serves the site from /<repo>; the deploy workflow sets this.
const basePath = (process.env.PAGES_BASE_PATH ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Content is read from the repo root at build time, outside this folder.
  turbopack: { root: __dirname },
};

export default nextConfig;
