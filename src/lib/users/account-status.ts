export const ACCOUNT_STATUSES = ["pending", "approved", "rejected"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export function normalizeAccountStatus(
  value: AccountStatus | null | undefined,
): AccountStatus {
  if (value == null || !ACCOUNT_STATUSES.includes(value)) {
    return "approved";
  }

  return value;
}

export function isUserAccountApproved(user: {
  accountStatus?: AccountStatus | null;
}): boolean {
  return normalizeAccountStatus(user.accountStatus) === "approved";
}

export function isUserAccountPending(user: {
  accountStatus?: AccountStatus | null;
}): boolean {
  return normalizeAccountStatus(user.accountStatus) === "pending";
}

export function isUserAccountRejected(user: {
  accountStatus?: AccountStatus | null;
}): boolean {
  return normalizeAccountStatus(user.accountStatus) === "rejected";
}

export function assertUserAccountApproved(user: {
  accountStatus?: AccountStatus | null;
}): void {
  if (!isUserAccountApproved(user)) {
    throw new Error("Account is not approved");
  }
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending: "ממתין לאישור",
  approved: "מאושר",
  rejected: "נדחה",
};

export function getAccountStatusLabel(
  status: AccountStatus | null | undefined,
): string {
  return ACCOUNT_STATUS_LABELS[normalizeAccountStatus(status)];
}

/** Mongo filter: approved accounts plus legacy rows without accountStatus. */
export const APPROVED_OR_LEGACY_ACCOUNT_STATUS_FILTER = {
  $or: [
    { accountStatus: "approved" as const },
    { accountStatus: { $exists: false } },
    { accountStatus: null },
  ],
};
