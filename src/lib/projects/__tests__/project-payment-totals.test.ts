import { describe, expect, it } from "vitest";
import { calculateProjectPaymentSummary } from "@/lib/projects/project-payment-totals";

describe("calculateProjectPaymentSummary", () => {
  it("calculates paid and remaining when project total is known", () => {
    const summary = calculateProjectPaymentSummary({
      projectTotalInclVatAgorot: 450_000,
      payments: [{ amountAgorot: 200_000 }, { amountAgorot: 50_000 }],
    });

    expect(summary.totalPaidAgorot).toBe(250_000);
    expect(summary.remainingAgorot).toBe(200_000);
    expect(summary.isOverpaid).toBe(false);
    expect(summary.isProjectTotalKnown).toBe(true);
    expect(summary.paymentSummaryCompact).toContain("/");
  });

  it("calculates overpayment when paid exceeds project total", () => {
    const summary = calculateProjectPaymentSummary({
      projectTotalInclVatAgorot: 100_000,
      payments: [{ amountAgorot: 150_000 }],
    });

    expect(summary.isOverpaid).toBe(true);
    expect(summary.overpaidAgorot).toBe(50_000);
    expect(summary.remainingAgorot).toBe(0);
  });

  it("leaves remaining unknown when project total is unavailable", () => {
    const summary = calculateProjectPaymentSummary({
      projectTotalInclVatAgorot: undefined,
      payments: [{ amountAgorot: 20_000 }],
    });

    expect(summary.totalPaidAgorot).toBe(20_000);
    expect(summary.remainingAgorot).toBeUndefined();
    expect(summary.isProjectTotalKnown).toBe(false);
    expect(summary.paymentSummaryCompact).toBeUndefined();
  });
});
