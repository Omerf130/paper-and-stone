import { describe, expect, it } from "vitest";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";

describe("resolvePostAuthRedirect", () => {
  it("routes clients to client workspace", () => {
    expect(resolvePostAuthRedirect("client")).toBe("/client");
  });

  it("routes architects to professional workspace", () => {
    expect(resolvePostAuthRedirect("architect")).toBe("/professional");
  });

  it("routes admins to admin workspace", () => {
    expect(resolvePostAuthRedirect("admin")).toBe("/admin");
  });
});
