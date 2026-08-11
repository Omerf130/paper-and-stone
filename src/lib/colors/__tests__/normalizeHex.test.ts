import { describe, expect, it } from "vitest";
import { normalizeHex } from "@/lib/colors/normalizeHex";

describe("normalizeHex", () => {
  it("normalizes 6-digit hex to uppercase", () => {
    expect(normalizeHex("#163f35")).toBe("#163F35");
  });

  it("expands 3-digit hex", () => {
    expect(normalizeHex("#abc")).toBe("#AABBCC");
  });

  it("rejects invalid hex", () => {
    expect(normalizeHex("163F35")).toBeNull();
    expect(normalizeHex("#GGGGGG")).toBeNull();
  });
});
