import { describe, expect, it } from "vitest";
import { getProjectRequiredActionHint } from "@/lib/projects/get-project-required-action-hint";

describe("getProjectRequiredActionHint", () => {
  it("maps project statuses to action hints", () => {
    expect(getProjectRequiredActionHint("changes_requested")).toBe(
      "נדרשת פעולה ממך",
    );
    expect(getProjectRequiredActionHint("draft")).toBe("ניתן להמשיך לערוך");
    expect(getProjectRequiredActionHint("submitted")).toBe("ממתין לבדיקה");
    expect(getProjectRequiredActionHint("approved")).toBe("אושר");
    expect(getProjectRequiredActionHint("rejected")).toBe("נדחה");
  });
});
