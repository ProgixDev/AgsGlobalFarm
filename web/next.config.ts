import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // The certificate template is read at runtime with fs.readFile, which Next's
  // static tracing cannot detect. Force it into the serverless bundle.
  // Covers both the REST routes and the server actions reached from the
  // /mes-formations quiz page.
  outputFileTracingIncludes: {
    "/api/formations/**": ["./src/assets/**"],
    "/mes-formations/**": ["./src/assets/**"],
  },
};

export default nextConfig;
