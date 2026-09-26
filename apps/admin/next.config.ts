import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@rapidaid/content-workflow", "@rapidaid/protocol-engine"],
};

export default nextConfig;
