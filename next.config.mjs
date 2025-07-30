/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import globImporter from "node-sass-glob-importer";
import path from "path";
import { fileURLToPath } from "node:url";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";
import crypto from "crypto";

const revision = crypto.randomUUID();

const jiti = createJiti(fileURLToPath(import.meta.url));

// Load environment variables
jiti("./src/libs/Env");

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  reloadOnOnline: false,
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = withSerwist(
  bundleAnalyzer({
    eslint: {
      dirs: ["."],
    },
    images: {
      domains: ['new.4youad.com'], // Add this line for image domain
      // OR use remotePatterns for more control:
      // remotePatterns: [
      //   {
      //     protocol: 'https',
      //     hostname: 'new.4youad.com',
      //     pathname: '/uploads/**',
      //   },
      // ],
    },
    sassOptions: {
      sourceMap: true,
      importer: globImporter(),
      includePaths: [path.join(process.cwd(), "styles")],
    },
    poweredByHeader: false,
    reactStrictMode: true,
  })
);

export default nextConfig;