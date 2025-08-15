/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["lucide-react"] },
  // output: 'export', // descomenta si quieres generar HTML estático en /out
};
export default nextConfig;
