import { describe, expect, it } from "vitest";
import {
  isAdminArchitectConversationType,
  normalizeProjectConversationType,
} from "@/lib/project-messages/normalizeProjectConversationType";

describe("normalizeProjectConversationType", () => {
  it("treats missing values as admin_architect", () => {
    expect(normalizeProjectConversationType(undefined)).toBe("admin_architect");
    expect(normalizeProjectConversationType(null)).toBe("admin_architect");
  });

  it("preserves architect_client", () => {
    expect(normalizeProjectConversationType("architect_client")).toBe(
      "architect_client",
    );
  });

  it("identifies admin architect conversations", () => {
    expect(isAdminArchitectConversationType(undefined)).toBe(true);
    expect(isAdminArchitectConversationType("admin_architect")).toBe(true);
    expect(isAdminArchitectConversationType("architect_client")).toBe(false);
  });
});
