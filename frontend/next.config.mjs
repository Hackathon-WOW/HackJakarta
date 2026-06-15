/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build a self-contained server for small production Docker images.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
