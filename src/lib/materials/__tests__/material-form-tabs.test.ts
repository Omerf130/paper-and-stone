import { describe, expect, it } from "vitest";
import {
  getTabsWithErrors,
  resolveFirstTabWithErrors,
  resolveMaterialFormTabForFieldError,
} from "@/lib/materials/material-form-tabs";

describe("resolveMaterialFormTabForFieldError", () => {
  it("maps general fields to general tab", () => {
    expect(resolveMaterialFormTabForFieldError("nameEn")).toBe("general");
    expect(resolveMaterialFormTabForFieldError("type")).toBe("general");
  });

  it("maps variant fields to variants tab", () => {
    expect(resolveMaterialFormTabForFieldError("variants.0.name")).toBe(
      "variants",
    );
  });
});

describe("resolveFirstTabWithErrors", () => {
  it("returns the first tab in display order with errors", () => {
    expect(
      resolveFirstTabWithErrors({
        "variants.0.name": "required",
        nameEn: "required",
      }),
    ).toBe("general");
  });
});

describe("getTabsWithErrors", () => {
  it("returns all tabs containing field errors", () => {
    expect(
      getTabsWithErrors({
        nameEn: "required",
        "variants.0.hex": "invalid",
      }),
    ).toEqual(new Set(["general", "variants"]));
  });
});
