import type { AccountStatus } from "@/lib/users/account-status";
import { normalizeAccountStatus } from "@/lib/users/account-status";
import { getAccountStatusLabel } from "@/lib/users/account-status";
import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";

export function mapAccountStatusToBadge(
  status: AccountStatus | null | undefined,
): { label: string; tone: StatusBadgeTone } {
  const normalized = normalizeAccountStatus(status);

  switch (normalized) {
    case "approved":
      return { label: getAccountStatusLabel(normalized), tone: "positive" };
    case "pending":
      return { label: getAccountStatusLabel(normalized), tone: "warning" };
    case "rejected":
      return { label: getAccountStatusLabel(normalized), tone: "negative" };
    default:
      return { label: getAccountStatusLabel(normalized), tone: "neutral" };
  }
}
