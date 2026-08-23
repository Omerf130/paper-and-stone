import { describe, expect, it } from "vitest";
import {
  normalizeAccountStatus,
  isUserAccountApproved,
  isUserAccountPending,
  isUserAccountRejected,
} from "@/lib/users/account-status";

describe("account-status", () => {
  it("normalizes missing accountStatus to approved for legacy users", () => {
    expect(normalizeAccountStatus(undefined)).toBe("approved");
    expect(normalizeAccountStatus(null)).toBe("approved");
  });

  it("preserves explicit account statuses", () => {
    expect(normalizeAccountStatus("pending")).toBe("pending");
    expect(normalizeAccountStatus("approved")).toBe("approved");
    expect(normalizeAccountStatus("rejected")).toBe("rejected");
  });

  it("evaluates approval helpers", () => {
    expect(isUserAccountApproved({ accountStatus: "approved" })).toBe(true);
    expect(isUserAccountApproved({ accountStatus: undefined })).toBe(true);
    expect(isUserAccountPending({ accountStatus: "pending" })).toBe(true);
    expect(isUserAccountRejected({ accountStatus: "rejected" })).toBe(true);
  });
});
