import { describe, expect, it } from "vitest";
import { parseProductFormInput } from "@/lib/products/product-validation";
import { EMPTY_PRODUCT_FORM } from "@/types/admin-product";

describe("product validation phase 19B", () => {
  it("requires supplierId on create/update input", () => {
    const result = parseProductFormInput({
      ...EMPTY_PRODUCT_FORM,
      nameHe: "ספה",
      slug: "sofa",
      sku: "SOFA-1",
      categoryId: "507f1f77bcf86cd799439011",
      supplierId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.supplierId).toBeTruthy();
    }
  });

  it("accepts internal catalog fields in admin input", () => {
    const result = parseProductFormInput({
      ...EMPTY_PRODUCT_FORM,
      nameHe: "ספה",
      slug: "sofa",
      sku: "SOFA-1",
      categoryId: "507f1f77bcf86cd799439011",
      supplierId: "507f1f77bcf86cd799439012",
      internalCatalogName: "Internal Sofa",
      catalogCode: "CAT-001",
    });

    expect(result.success).toBe(true);
  });
});
