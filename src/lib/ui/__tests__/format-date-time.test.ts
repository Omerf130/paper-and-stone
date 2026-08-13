import { describe, expect, it } from "vitest";
import { formatDateTime } from "@/lib/ui/format-date-time";

describe("formatDateTime", () => {
  it("formats valid ISO dates in Hebrew locale", () => {
    const formatted = formatDateTime("2026-01-01T10:00:00.000Z");
    expect(formatted).not.toBe("—");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("returns fallback for missing values", () => {
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("", "לא זמין")).toBe("לא זמין");
  });
});
