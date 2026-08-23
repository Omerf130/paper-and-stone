import { describe, expect, it } from "vitest";
import { PROJECT_ITEM_STATUSES } from "@/types/project-item-status";
import {
  getAdminStatusMenuOptions,
  getArchitectStatusMenuOptions,
} from "@/lib/project-items/project-item-status-menu-options";

describe("project-item-status-menu-options", () => {
  describe("getAdminStatusMenuOptions", () => {
    it("returns all known statuses with current marked", () => {
      const options = getAdminStatusMenuOptions("client_approved");

      expect(options.map((option) => option.value)).toEqual(PROJECT_ITEM_STATUSES);
      expect(options.find((option) => option.value === "client_approved")?.isCurrent).toBe(
        true,
      );
      expect(
        options.filter((option) => option.value !== "client_approved").every(
          (option) => !option.isCurrent,
        ),
      ).toBe(true);
    });
  });

  describe("getArchitectStatusMenuOptions", () => {
    it("returns only allowed target statuses without current marker", () => {
      const options = getArchitectStatusMenuOptions(["quoting", "selected"]);

      expect(options.map((option) => option.value)).toEqual(["quoting", "selected"]);
      expect(options.every((option) => !option.isCurrent)).toBe(true);
    });

    it("returns empty list when no transitions are available", () => {
      expect(getArchitectStatusMenuOptions([])).toEqual([]);
    });
  });
});
