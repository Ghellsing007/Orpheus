/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Generate a standalone build for smaller Docker runtime images.
  output: "standalone",
}

export default nextConfig
