import { describe, expect, it } from "vitest";
import { formatCategoryProductCountLabel } from "@/lib/catalog/format-category-product-count-label";

describe("formatCategoryProductCountLabel", () => {
  it("formats singular and plural counts", () => {
    expect(formatCategoryProductCountLabel(0)).toBe("0 פריטים");
    expect(formatCategoryProductCountLabel(1)).toBe("פריט אחד");
    expect(formatCategoryProductCountLabel(2)).toBe("2 פריטים");
  });
});
