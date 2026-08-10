import { describe, expect, it } from "vitest";
import {
  hashSessionToken,
  isSessionExpired,
} from "@/lib/auth/session";

describe("session token", () => {
  it("hashes tokens consistently", () => {
    const token = "example-session-token";
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toBe(token);
  });

  it("rejects expired sessions", () => {
    const expiredAt = new Date("2020-01-01T00:00:00.000Z");
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(isSessionExpired(expiredAt, now)).toBe(true);
  });

  it("accepts valid sessions", () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(isSessionExpired(expiresAt, now)).toBe(false);
  });
});
