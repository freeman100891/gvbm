/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'dexie', 'dexie-react-hooks'],
};

export default nextConfig;
