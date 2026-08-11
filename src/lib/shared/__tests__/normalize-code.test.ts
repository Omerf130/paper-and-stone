import { describe, expect, it } from "vitest";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";

describe("normalizeOptionalCode", () => {
  it("returns undefined for blank values", () => {
    expect(normalizeOptionalCode("")).toBeUndefined();
    expect(normalizeOptionalCode("   ")).toBeUndefined();
  });

  it("trims and uppercases codes", () => {
    expect(normalizeOptionalCode(" vel-001 ")).toBe("VEL-001");
  });
});
