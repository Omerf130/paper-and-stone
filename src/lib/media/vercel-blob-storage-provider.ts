import { del } from "@vercel/blob";
import type { MediaStorageProvider, MediaUploadInput } from "./media-storage-provider";

export class VercelBlobStorageProvider implements MediaStorageProvider {
  async upload(input: MediaUploadInput): Promise<never> {
    void input;
    throw new Error(
      "Server-side upload is not used. Use Vercel Blob client upload instead.",
    );
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await del(storageKey);
    } catch (error: unknown) {
      console.warn(
        `[media] Best-effort blob delete failed for ${storageKey}:`,
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }
}

export const vercelBlobStorageProvider = new VercelBlobStorageProvider();
