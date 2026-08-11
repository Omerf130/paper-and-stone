import type { NextConfig } from "next";

const blobStoreId = process.env.BLOB_STORE_ID?.trim();

const blobRemotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: "https",
    hostname: "*.public.blob.vercel-storage.com",
    pathname: "/**",
  },
];

if (blobStoreId) {
  blobRemotePatterns.unshift({
    protocol: "https",
    hostname: `${blobStoreId}.public.blob.vercel-storage.com`,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: blobRemotePatterns,
  },
};

export default nextConfig;
