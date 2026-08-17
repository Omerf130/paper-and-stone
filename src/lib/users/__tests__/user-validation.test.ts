import { describe, expect, it } from "vitest";
import { parseUserRole } from "@/lib/users/user-validation";

describe("parseUserRole", () => {
  it("accepts client role", () => {
    expect(parseUserRole("client")).toEqual({
      success: true,
      data: "client",
    });
  });

  it("accepts architect role", () => {
    expect(parseUserRole("architect")).toEqual({
      success: true,
      data: "architect",
    });
  });

  it("rejects legacy professional role", () => {
    expect(parseUserRole("professional")).toEqual({
      success: false,
      error: "תפקיד לא תקין.",
    });
  });

  it("rejects customer role", () => {
    expect(parseUserRole("customer")).toEqual({
      success: false,
      error: "תפקיד לא תקין.",
    });
  });
});
