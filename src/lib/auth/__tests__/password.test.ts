import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("secure-password");
    expect(hash).not.toBe("secure-password");
    expect(await verifyPassword("secure-password", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("secure-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
