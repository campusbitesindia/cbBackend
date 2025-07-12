/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Removed API rewrites since we're calling backend directly via axios
  // The rewrites were causing double /api/v1/ in URLs
}

export default nextConfig
