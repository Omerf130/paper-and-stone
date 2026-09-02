import { describe, expect, it } from "vitest";
import {
  ADMIN_PROJECT_TAB_LABELS,
  isAdminProjectTabId,
  resolveAdminProjectTabId,
} from "@/lib/projects/admin-project-tab-params";

describe("admin-project-tab-params", () => {
  it("includes history tab", () => {
    expect(ADMIN_PROJECT_TAB_LABELS.history).toBe("היסטוריה");
    expect(isAdminProjectTabId("history")).toBe(true);
  });

  it("defaults to summary tab", () => {
    expect(resolveAdminProjectTabId(undefined)).toBe("summary");
  });

  it("resolves history tab from param", () => {
    expect(resolveAdminProjectTabId("history")).toBe("history");
  });
});
