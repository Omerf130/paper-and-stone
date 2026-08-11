import type { MediaStorageProvider } from "./media-storage-provider";
import { vercelBlobStorageProvider } from "./vercel-blob-storage-provider";

export function getMediaStorageProvider(): MediaStorageProvider {
  return vercelBlobStorageProvider;
}
