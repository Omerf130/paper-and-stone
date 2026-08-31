import { describe, expect, it } from "vitest";
import {
  parseProjectPaymentInput,
  parseProjectPaymentUpdateInput,
} from "@/lib/projects/project-payment-validation";

describe("project-payment-validation", () => {
  it("parses valid payment input", () => {
    const result = parseProjectPaymentInput({
      projectId: "507f1f77bcf86cd799439011",
      amountShekels: "1000.50",
      paymentDate: "2026-08-31",
      paymentMethod: "bank_transfer",
      note: "  תשלום ראשון  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amountAgorot).toBe(100_050);
      expect(result.data.note).toBe("תשלום ראשון");
    }
  });

  it("rejects non-positive amounts", () => {
    const result = parseProjectPaymentInput({
      projectId: "507f1f77bcf86cd799439011",
      amountShekels: "0",
      paymentDate: "2026-08-31",
      paymentMethod: "cash",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid payment method", () => {
    const result = parseProjectPaymentInput({
      projectId: "507f1f77bcf86cd799439011",
      amountShekels: "100",
      paymentDate: "2026-08-31",
      paymentMethod: "paypal" as "cash",
    });

    expect(result.success).toBe(false);
  });

  it("parses update input with payment id", () => {
    const result = parseProjectPaymentUpdateInput({
      paymentId: "507f1f77bcf86cd799439012",
      projectId: "507f1f77bcf86cd799439011",
      amountShekels: "250",
      paymentDate: "2026-08-31",
      paymentMethod: "check",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentId).toBe("507f1f77bcf86cd799439012");
      expect(result.data.amountAgorot).toBe(25_000);
    }
  });
});
