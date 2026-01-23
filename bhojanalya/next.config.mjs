/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // 1. Catches any request starting with /api/
        source: '/api/:path*',
        // 2. Sends it to your Go Backend
        // ⚠️ Make sure this port (8080) matches your Go server!
        destination: 'http://localhost:8000/:path*', 
      },
    ];
  },
};

export default nextConfig;