import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enables single-file `node server.js` runtime build for Docker.
    output: "standalone",
    allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
