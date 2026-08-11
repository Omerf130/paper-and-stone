import { randomUUID } from "crypto";
import type { MediaSlot } from "@/types/admin-product-media";
import { sanitizeFilename } from "./sanitize-filename";

export function getStoragePathPrefix(
  productId: string,
  slot: MediaSlot,
): string {
  return `products/${productId}/${slot}/`;
}

export function buildStoragePath(
  productId: string,
  slot: MediaSlot,
  originalFilename: string,
): string {
  const safeName = sanitizeFilename(originalFilename);
  return `${getStoragePathPrefix(productId, slot)}${randomUUID()}-${safeName}`;
}

export function isPathnameInSlotNamespace(
  pathname: string,
  productId: string,
  slot: MediaSlot,
): boolean {
  const prefix = getStoragePathPrefix(productId, slot);
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const remainder = pathname.slice(prefix.length);
  return remainder.length > 0 && !remainder.includes("..") && !remainder.includes("//");
}
