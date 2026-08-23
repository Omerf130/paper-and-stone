import { describe, expect, it } from "vitest";
import {
  getNormalizedProjectItemStatus,
  normalizeProjectItemStatus,
} from "@/lib/project-items/project-item-status-normalize";

describe("project-item-status-normalize", () => {
  it("defaults missing status to draft", () => {
    expect(normalizeProjectItemStatus(undefined)).toBe("draft");
    expect(normalizeProjectItemStatus(null)).toBe("draft");
    expect(getNormalizedProjectItemStatus({} as never)).toBe("draft");
  });

  it("preserves known statuses", () => {
    expect(normalizeProjectItemStatus("client_review")).toBe("client_review");
  });
});
