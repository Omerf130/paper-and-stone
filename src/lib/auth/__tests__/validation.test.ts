import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/auth/validation";

describe("validation", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "User@Example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects short passwords on register", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short",
      passwordConfirm: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      passwordConfirm: "password456",
    });

    expect(result.success).toBe(false);
  });
});
