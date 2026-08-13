import { describe, expect, it } from "vitest";
import {
  formatAgorotToShekelsInput,
  parseShekelsInputToAgorot,
} from "@/lib/money/parse-money-input";
import { formatIlsAgorot } from "@/lib/money/format-ils";

describe("money helpers", () => {
  it("parses shekel decimal input to agorot", () => {
    expect(parseShekelsInputToAgorot("7000")).toBe(700000);
    expect(parseShekelsInputToAgorot("7000.50")).toBe(700050);
    expect(parseShekelsInputToAgorot("-500")).toBe(-50000);
    expect(parseShekelsInputToAgorot("7,000.25")).toBe(700025);
  });

  it("rejects invalid money input", () => {
    expect(parseShekelsInputToAgorot("")).toBeNull();
    expect(parseShekelsInputToAgorot("abc")).toBeNull();
    expect(parseShekelsInputToAgorot("10.999")).toBeNull();
  });

  it("formats agorot for display and input roundtrip", () => {
    expect(formatIlsAgorot(700000)).toContain("₪");
    expect(formatAgorotToShekelsInput(700050)).toBe("7000.50");
  });
});
