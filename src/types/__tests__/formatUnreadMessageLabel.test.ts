import { describe, expect, it } from "vitest";
import { formatUnreadMessageLabel } from "@/types/project-message";

describe("formatUnreadMessageLabel", () => {
  it("returns null for zero or negative counts", () => {
    expect(formatUnreadMessageLabel(0)).toBeNull();
    expect(formatUnreadMessageLabel(-1)).toBeNull();
  });

  it("returns singular label for one unread message", () => {
    expect(formatUnreadMessageLabel(1)).toBe("הודעה חדשה");
  });

  it("returns plural label for multiple unread messages", () => {
    expect(formatUnreadMessageLabel(3)).toBe("3 הודעות חדשות");
  });
});
