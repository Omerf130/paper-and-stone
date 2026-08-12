import { describe, expect, it } from "vitest";
import {
  assertProjectDeletable,
  assertProjectEditable,
  isProjectDeletable,
  isProjectReadOnly,
} from "@/lib/projects/assertProjectEditable";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";

describe("assertProjectEditable", () => {
  it("allows draft and changes_requested", () => {
    expect(assertProjectEditable({ status: "draft" } as never).status).toBe(
      "draft",
    );
    expect(
      assertProjectEditable({ status: "changes_requested" } as never).status,
    ).toBe("changes_requested");
  });

  it("rejects submitted projects", () => {
    expect(() =>
      assertProjectEditable({ status: "submitted" } as never),
    ).toThrow(PROJECT_ERRORS.NOT_EDITABLE);
  });

  it("marks read-only statuses", () => {
    expect(isProjectReadOnly("submitted")).toBe(true);
    expect(isProjectReadOnly("draft")).toBe(false);
  });

  it("allows delete only for never-submitted drafts", () => {
    expect(
      isProjectDeletable({
        status: "draft",
        reviewHistory: [],
      }),
    ).toBe(true);

    expect(
      isProjectDeletable({
        status: "draft",
        reviewHistory: [
          {
            action: "submitted",
          } as never,
        ],
      }),
    ).toBe(false);

    expect(() =>
      assertProjectDeletable({
        status: "draft",
        reviewHistory: [{ action: "submitted" } as never],
      } as never),
    ).toThrow(PROJECT_ERRORS.NOT_DELETABLE);
  });
});
