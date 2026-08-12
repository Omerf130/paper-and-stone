import { describe, expect, it } from "vitest";
import { parseProjectMessageBody } from "@/lib/project-messages/message-validation";

describe("parseProjectMessageBody", () => {
  it("trims and accepts valid body", () => {
    const result = parseProjectMessageBody("  hello  ");

    expect(result).toEqual({ success: true, data: "hello" });
  });

  it("rejects blank body", () => {
    const result = parseProjectMessageBody("   ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.body).toBeDefined();
    }
  });

  it("rejects body over 4000 characters", () => {
    const result = parseProjectMessageBody("a".repeat(4001));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.body).toContain("4000");
    }
  });
});
