import { describe, expect, it } from "vitest";
import {
  parseActiveStatus,
  parseUserId,
  parseUserRole,
} from "@/lib/users/user-validation";

describe("user-validation", () => {
  it("accepts valid role enum", () => {
    expect(parseUserRole("professional")).toEqual({
      success: true,
      data: "professional",
    });
  });

  it("rejects invalid role", () => {
    expect(parseUserRole("superadmin").success).toBe(false);
  });

  it("rejects invalid user id", () => {
    expect(parseUserId("not-an-id").success).toBe(false);
  });

  it("accepts valid object id", () => {
    expect(parseUserId("507f1f77bcf86cd799439011").success).toBe(true);
  });

  it("requires boolean active status", () => {
    expect(parseActiveStatus("true").success).toBe(false);
    expect(parseActiveStatus(true)).toEqual({ success: true, data: true });
  });
});
