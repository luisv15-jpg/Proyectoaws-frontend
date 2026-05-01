import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: true,  // ← Necesario para exportación estática
  },
};
export default nextConfig;
