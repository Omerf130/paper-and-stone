import { describe, expect, it } from "vitest";
import {
  getProductWorkspaceTabLabels,
  resolveProductWorkspaceTabId,
} from "@/lib/products/get-product-detail-tabs";

describe("getProductWorkspaceTabLabels", () => {
  it("returns all four workspace tabs", () => {
    const labels = getProductWorkspaceTabLabels();

    expect(labels.map((tab) => tab.label)).toEqual([
      "מוצר",
      "שרטוט ומידות",
      "פרטי מוצר",
      "מידע טכני",
    ]);
    expect(labels.map((tab) => tab.id)).toEqual([
      "product",
      "drawing",
      "details",
      "technical",
    ]);
  });
});

describe("resolveProductWorkspaceTabId", () => {
  it("supports deep links for all workspace tabs", () => {
    expect(resolveProductWorkspaceTabId("product")).toBe("product");
    expect(resolveProductWorkspaceTabId("drawing")).toBe("drawing");
    expect(resolveProductWorkspaceTabId("details")).toBe("details");
    expect(resolveProductWorkspaceTabId("technical")).toBe("technical");
  });

  it("falls back to product for unknown tab values", () => {
    expect(resolveProductWorkspaceTabId("unknown")).toBe("product");
    expect(resolveProductWorkspaceTabId(null)).toBe("product");
  });
});
