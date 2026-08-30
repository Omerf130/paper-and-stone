import { describe, expect, it } from "vitest";
import {
  getTabsWithErrors,
  resolveFirstTabWithErrors,
  resolveProductFormTabForFieldError,
} from "@/lib/products/product-form-tabs";

describe("resolveProductFormTabForFieldError", () => {
  it("maps general fields to general tab", () => {
    expect(resolveProductFormTabForFieldError("nameHe")).toBe("general");
    expect(resolveProductFormTabForFieldError("supplierId")).toBe("general");
    expect(resolveProductFormTabForFieldError("internalCatalogName")).toBe(
      "general",
    );
  });

  it("maps materials and sizes to materials tab", () => {
    expect(resolveProductFormTabForFieldError("materialOptions.0.materialId")).toBe(
      "materials",
    );
    expect(resolveProductFormTabForFieldError("sizes.1.label")).toBe("materials");
  });

  it("maps technical fields to technical tab", () => {
    expect(resolveProductFormTabForFieldError("width")).toBe("technical");
    expect(resolveProductFormTabForFieldError("documents.0.url")).toBe(
      "technical",
    );
  });

  it("maps pricing fields to pricing tab", () => {
    expect(resolveProductFormTabForFieldError("defaultInternalCostShekels")).toBe(
      "pricing",
    );
  });
});

describe("resolveFirstTabWithErrors", () => {
  it("returns the first tab in display order that has errors", () => {
    expect(
      resolveFirstTabWithErrors({
        defaultInternalCostShekels: "invalid",
        nameHe: "required",
      }),
    ).toBe("general");
  });
});

describe("getTabsWithErrors", () => {
  it("returns all tabs that contain field errors", () => {
    expect(
      getTabsWithErrors({
        nameHe: "required",
        width: "invalid",
        defaultInternalCostShekels: "invalid",
      }),
    ).toEqual(new Set(["general", "technical", "pricing"]));
  });
});
