/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/frontend/index.html',
      },
      {
        source: '/:path((?!admin|api|_next|uploads).*\\.(?:html|css|js|png|jpg|jpeg|JPG|gif|svg|ico|pdf|mp4|webp|woff|woff2|ttf))',
        destination: '/frontend/:path',
      },
      {
        source: '/assets/:path*',
        destination: '/frontend/assets/:path*',
      },
      {
        source: '/css/:path*',
        destination: '/frontend/css/:path*',
      },
      {
        source: '/js/:path*',
        destination: '/frontend/js/:path*',
      },
      {
        source: '/reports/:path*',
        destination: '/frontend/reports/:path*',
      },
    ];
  },
};

export default nextConfig;
