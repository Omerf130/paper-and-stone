import {
  calculateVatFromTaxableBase,
  multiplyUnitPriceAgorot,
  sumAgorot,
} from "@/lib/money/agorot-math";
import {
  DEFAULT_VAT_RATE_BASIS_POINTS,
  type QuoteTaxMode,
  type QuoteTotalsView,
} from "@/types/project-quote";
import { formatIlsAgorot } from "@/lib/money/format-ils";

export type QuoteCalculationItemLine = {
  quantity: number;
  unitPriceAgorot: number;
};

export type QuoteCalculationAdditionalLine = {
  amountAgorot: number;
};

export type QuoteCalculationInput = {
  itemLines: QuoteCalculationItemLine[];
  additionalLines: QuoteCalculationAdditionalLine[];
  vatRateBasisPoints?: number;
  taxMode?: QuoteTaxMode;
};

export type QuoteCalculationResult = {
  lineTotalsAgorot: number[];
  subtotalAgorot: number;
  adjustmentsAgorot: number;
  taxableBaseAgorot: number;
  taxAmountAgorot: number;
  totalAgorot: number;
  vatRateBasisPoints: number;
  taxMode: QuoteTaxMode;
};

export function calculateQuoteAmounts(
  input: QuoteCalculationInput,
): QuoteCalculationResult {
  const vatRateBasisPoints =
    input.vatRateBasisPoints ?? DEFAULT_VAT_RATE_BASIS_POINTS;
  const taxMode = input.taxMode ?? "exclusive";

  const lineTotalsAgorot = input.itemLines.map((line) =>
    multiplyUnitPriceAgorot(line.unitPriceAgorot, line.quantity),
  );
  const subtotalAgorot = sumAgorot(lineTotalsAgorot);
  const adjustmentsAgorot = sumAgorot(
    input.additionalLines.map((line) => line.amountAgorot),
  );

  // VAT applies to the net commercial base: product subtotal plus adjustments,
  // including negative discount lines.
  const taxableBaseAgorot = subtotalAgorot + adjustmentsAgorot;

  let taxAmountAgorot = 0;
  if (taxMode === "exclusive") {
    taxAmountAgorot = calculateVatFromTaxableBase(
      taxableBaseAgorot,
      vatRateBasisPoints,
    );
  }

  const totalAgorot = taxableBaseAgorot + taxAmountAgorot;

  return {
    lineTotalsAgorot,
    subtotalAgorot,
    adjustmentsAgorot,
    taxableBaseAgorot,
    taxAmountAgorot,
    totalAgorot,
    vatRateBasisPoints,
    taxMode,
  };
}

export function mapCalculationToTotalsView(
  calculation: QuoteCalculationResult,
): QuoteTotalsView {
  return {
    subtotalAgorot: calculation.subtotalAgorot,
    subtotalFormatted: formatIlsAgorot(calculation.subtotalAgorot),
    adjustmentsAgorot: calculation.adjustmentsAgorot,
    adjustmentsFormatted: formatIlsAgorot(calculation.adjustmentsAgorot),
    taxableBaseAgorot: calculation.taxableBaseAgorot,
    taxableBaseFormatted: formatIlsAgorot(calculation.taxableBaseAgorot),
    taxAmountAgorot: calculation.taxAmountAgorot,
    taxAmountFormatted: formatIlsAgorot(calculation.taxAmountAgorot),
    totalAgorot: calculation.totalAgorot,
    totalFormatted: formatIlsAgorot(calculation.totalAgorot),
    vatRateBasisPoints: calculation.vatRateBasisPoints,
    taxMode: calculation.taxMode,
  };
}
