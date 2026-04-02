/** @type {import('next').NextConfig} */

 


const nextConfig = {
  // TypeScript vérifié séparément via `bun run check-types` (gain ~40s sur le build)
  typescript: {
    ignoreBuildErrors: true,
  },
  //     eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;
