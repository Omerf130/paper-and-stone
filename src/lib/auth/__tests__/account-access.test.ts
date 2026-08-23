import { describe, expect, it } from "vitest";
import {
  canAccessClientWorkspace,
  isArchitectApplicant,
  isPlainClientApplicant,
  resolvePostAuthDestination,
} from "@/lib/auth/account-access";

describe("account-access", () => {
  it("redirects pending and rejected users to account status", () => {
    expect(
      resolvePostAuthDestination({ role: "client", accountStatus: "pending" }),
    ).toBe("/account/status");
    expect(
      resolvePostAuthDestination({ role: "architect", accountStatus: "rejected" }),
    ).toBe("/account/status");
  });

  it("redirects approved users to role workspace", () => {
    expect(
      resolvePostAuthDestination({ role: "client", accountStatus: "approved" }),
    ).toBe("/client");
    expect(
      resolvePostAuthDestination({ role: "architect", accountStatus: "approved" }),
    ).toBe("/professional");
  });

  it("blocks workspace access until account is approved", () => {
    expect(
      canAccessClientWorkspace({
        role: "client",
        accountStatus: "pending",
        isActive: true,
      }),
    ).toBe(false);
    expect(
      canAccessClientWorkspace({
        role: "client",
        accountStatus: "approved",
        isActive: true,
      }),
    ).toBe(true);
  });

  it("distinguishes architect applicants from plain client applicants", () => {
    expect(
      isArchitectApplicant({
        role: "client",
        requestedRole: "architect",
        accountStatus: "pending",
      }),
    ).toBe(true);
    expect(
      isPlainClientApplicant({
        role: "client",
        requestedRole: null,
        accountStatus: "pending",
      }),
    ).toBe(true);
    expect(
      isPlainClientApplicant({
        role: "client",
        requestedRole: "architect",
        accountStatus: "pending",
      }),
    ).toBe(false);
  });
});
