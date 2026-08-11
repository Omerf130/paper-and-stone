import { describe, expect, it } from "vitest";
import {
  buildStoragePath,
  getStoragePathPrefix,
  isPathnameInSlotNamespace,
} from "@/lib/media/build-storage-path";

describe("build-storage-path", () => {
  const productId = "507f1f77bcf86cd799439011";

  it("builds paths under the product slot namespace", () => {
    const path = buildStoragePath(productId, "primary", "My Photo.JPG");
    expect(path.startsWith(getStoragePathPrefix(productId, "primary"))).toBe(
      true,
    );
    expect(path).toMatch(/my-photo\.jpg$/);
  });

  it("rejects path traversal in namespace check", () => {
    expect(
      isPathnameInSlotNamespace(
        `products/${productId}/gallery/../primary/evil.jpg`,
        productId,
        "gallery",
      ),
    ).toBe(false);
  });

  it("accepts valid gallery pathname", () => {
    const path = buildStoragePath(productId, "gallery", "image.png");
    expect(isPathnameInSlotNamespace(path, productId, "gallery")).toBe(true);
  });
});
