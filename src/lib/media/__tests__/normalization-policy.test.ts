import { describe, expect, it } from "vitest";
import {
  shouldNormalizeMediaSlot,
  shouldNormalizeMediaType,
} from "@/lib/media/normalization-policy";

describe("normalization policy", () => {
  it("normalizes product photography slots only", () => {
    expect(shouldNormalizeMediaSlot("primary")).toBe(true);
    expect(shouldNormalizeMediaSlot("gallery")).toBe(true);
    expect(shouldNormalizeMediaSlot("technical")).toBe(false);
    expect(shouldNormalizeMediaSlot("recolor-mask")).toBe(false);
  });

  it("normalizes product image media type only", () => {
    expect(shouldNormalizeMediaType("PRODUCT_IMAGE")).toBe(true);
    expect(shouldNormalizeMediaType("TECHNICAL_DRAWING")).toBe(false);
    expect(shouldNormalizeMediaType("RECOLOR_MASK")).toBe(false);
  });
});
