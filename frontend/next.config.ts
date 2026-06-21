import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Root lockfile at repo root would otherwise make Turbopack resolve from
  // messagebuddy/ instead of frontend/, breaking `@import "tailwindcss"`.
  turbopack: {
    root: frontendRoot,
  },
  outputFileTracingRoot: frontendRoot,
};

export default nextConfig;
