import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  async rewrites() {
    const productBase = process.env.PRODUCT_BASE ?? 'http://localhost:5001';
    const orderBase = process.env.ORDER_BASE ?? 'http://localhost:5002';
    return [
      { source: '/api/products/:path*', destination: `${productBase}/products/:path*` },
      { source: '/api/orders/:path*',   destination: `${orderBase}/orders/:path*`   },
    ];
  },
};

export default nextConfig;
