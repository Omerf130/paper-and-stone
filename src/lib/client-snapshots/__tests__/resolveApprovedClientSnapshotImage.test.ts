import { describe, expect, it } from "vitest";
import { resolveApprovedClientSnapshotImage } from "@/lib/client-snapshots/resolveApprovedClientSnapshotImage";

describe("resolveApprovedClientSnapshotImage", () => {
  const productName = "ספת Milano";

  it("uses source alt when url and non-empty alt exist", () => {
    expect(
      resolveApprovedClientSnapshotImage(
        {
          url: "https://cdn.example/sofa.jpg",
          altText: "ספת Milano ירוקה",
        },
        productName,
      ),
    ).toEqual({
      url: "https://cdn.example/sofa.jpg",
      alt: "ספת Milano ירוקה",
    });
  });

  it("falls back to product name when alt is missing", () => {
    expect(
      resolveApprovedClientSnapshotImage(
        {
          url: "https://cdn.example/sofa.jpg",
          altText: "",
        },
        productName,
      ),
    ).toEqual({
      url: "https://cdn.example/sofa.jpg",
      alt: productName,
    });
  });

  it("falls back to product name when alt is whitespace", () => {
    expect(
      resolveApprovedClientSnapshotImage(
        {
          url: "https://cdn.example/sofa.jpg",
          altText: "   ",
        },
        productName,
      ),
    ).toEqual({
      url: "https://cdn.example/sofa.jpg",
      alt: productName,
    });
  });

  it("omits image when url is absent", () => {
    expect(resolveApprovedClientSnapshotImage(undefined, productName)).toBeUndefined();
    expect(
      resolveApprovedClientSnapshotImage({ url: "", altText: "alt" }, productName),
    ).toBeUndefined();
    expect(
      resolveApprovedClientSnapshotImage(
        { url: "   ", altText: "alt" },
        productName,
      ),
    ).toBeUndefined();
  });
});
