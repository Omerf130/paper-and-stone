import { formatIlsAgorot } from "@/lib/money/format-ils";
import { sumAgorot } from "@/lib/money/agorot-math";
import type { AdminProjectPaymentSummaryView } from "@/types/project-payment";

export type ProjectPaymentTotalsInput = {
  projectTotalInclVatAgorot?: number;
  payments: Array<{ amountAgorot: number }>;
};

export function calculateProjectPaymentSummary(
  input: ProjectPaymentTotalsInput,
): AdminProjectPaymentSummaryView {
  const totalPaidAgorot = sumAgorot(input.payments.map((payment) => payment.amountAgorot));
  const isProjectTotalKnown = input.projectTotalInclVatAgorot != null;
  const projectTotalInclVatAgorot = input.projectTotalInclVatAgorot;

  let remainingAgorot: number | undefined;
  let overpaidAgorot: number | undefined;
  let isOverpaid = false;

  if (isProjectTotalKnown && projectTotalInclVatAgorot != null) {
    const delta = totalPaidAgorot - projectTotalInclVatAgorot;
    if (delta > 0) {
      isOverpaid = true;
      overpaidAgorot = delta;
      remainingAgorot = 0;
    } else {
      remainingAgorot = projectTotalInclVatAgorot - totalPaidAgorot;
    }
  }

  const totalPaidFormatted = formatIlsAgorot(totalPaidAgorot);
  const projectTotalInclVatFormatted =
    projectTotalInclVatAgorot != null
      ? formatIlsAgorot(projectTotalInclVatAgorot)
      : undefined;

  return {
    projectTotalInclVatAgorot,
    projectTotalInclVatFormatted,
    totalPaidAgorot,
    totalPaidFormatted,
    remainingAgorot,
    remainingFormatted:
      remainingAgorot != null ? formatIlsAgorot(remainingAgorot) : undefined,
    overpaidAgorot,
    overpaidFormatted:
      overpaidAgorot != null ? formatIlsAgorot(overpaidAgorot) : undefined,
    isOverpaid,
    isProjectTotalKnown,
    paymentSummaryCompact:
      isProjectTotalKnown && projectTotalInclVatFormatted
        ? `${totalPaidFormatted} / ${projectTotalInclVatFormatted}`
        : undefined,
  };
}
