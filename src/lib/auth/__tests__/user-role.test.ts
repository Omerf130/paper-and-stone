import { describe, expect, it } from "vitest";
import {
  buildRoleFilter,
  isArchitectRole,
  isClientRole,
  normalizeUserRole,
} from "@/lib/auth/user-role";

describe("user-role", () => {
  it("normalizes legacy customer to client", () => {
    expect(normalizeUserRole("customer")).toBe("client");
  });

  it("normalizes legacy professional to architect", () => {
    expect(normalizeUserRole("professional")).toBe("architect");
  });

  it("passes through canonical roles", () => {
    expect(normalizeUserRole("client")).toBe("client");
    expect(normalizeUserRole("architect")).toBe("architect");
    expect(normalizeUserRole("admin")).toBe("admin");
  });

  it("detects client roles including legacy", () => {
    expect(isClientRole("client")).toBe(true);
    expect(isClientRole("customer")).toBe(true);
    expect(isClientRole("architect")).toBe(false);
  });

  it("detects architect roles including legacy", () => {
    expect(isArchitectRole("architect")).toBe(true);
    expect(isArchitectRole("professional")).toBe(true);
    expect(isArchitectRole("client")).toBe(false);
  });

  it("builds legacy-compatible role filters", () => {
    expect(buildRoleFilter("client")).toEqual({
      $in: ["client", "customer"],
    });
    expect(buildRoleFilter("architect")).toEqual({
      $in: ["architect", "professional"],
    });
    expect(buildRoleFilter("admin")).toBe("admin");
  });
});
