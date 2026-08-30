import { describe, expect, it } from "vitest";
import { mapProductDocumentsToPublic } from "@/lib/products/mapProductDocumentsToPublic";

describe("mapProductDocumentsToPublic", () => {
  it("maps valid documents and strips invalid entries", () => {
    const mapped = mapProductDocumentsToPublic([
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        label: " מפרט טכני ",
        url: " https://example.com/spec.pdf ",
        fileType: " pdf ",
        sortOrder: 1,
      },
      {
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        label: "",
        url: "https://example.com/ignored.pdf",
        sortOrder: 0,
      },
    ] as never);

    expect(mapped).toEqual([
      {
        id: "507f1f77bcf86cd799439011",
        label: "מפרט טכני",
        url: "https://example.com/spec.pdf",
        fileType: "pdf",
      },
    ]);
  });

  it("returns an empty array when documents are missing", () => {
    expect(mapProductDocumentsToPublic(undefined)).toEqual([]);
  });
});
