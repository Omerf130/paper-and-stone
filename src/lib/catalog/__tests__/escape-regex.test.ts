import { describe, expect, it } from "vitest";
import { escapeRegex } from "@/lib/catalog/escape-regex";

describe("escapeRegex", () => {
  it("escapes regex special characters", () => {
    expect(escapeRegex("a.b(c)*")).toBe("a\\.b\\(c\\)\\*");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeRegex("milano")).toBe("milano");
  });
});
