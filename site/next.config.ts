import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Самодостатній артефакт для Docker (тягне лише потрібні файли у .next/standalone).
  output: "standalone",
};

export default nextConfig;
