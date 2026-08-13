import type { IProjectQuote } from "@/models/ProjectQuote";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import { formatAgorotToShekelsInput } from "@/lib/money/parse-money-input";
import {
  mapCalculationToTotalsView,
  type QuoteCalculationResult,
} from "@/lib/quotes/quote-calculations";
import type {
  AdminQuoteDisplayView,
  AdminQuoteFormView,
  AdminQuoteHistoryItemView,
  ProfessionalQuoteDisplayView,
  ProfessionalQuoteHistoryItemView,
  QuoteAdditionalLineView,
  QuoteItemLineView,
} from "@/types/project-quote";
import { getProjectQuoteStatusLabel } from "@/lib/quotes/quote-display-helpers";

function mapItemLinesToView(quote: IProjectQuote): QuoteItemLineView[] {
  return quote.itemLines.map((line) => ({
    projectItemId: line.projectItemId.toString(),
    productId: line.productId.toString(),
    productNameSnapshot: line.productNameSnapshot,
    skuSnapshot: line.skuSnapshot,
    configurationSummary: line.configurationSummary,
    quantity: line.quantity,
    unitPriceAgorot: line.unitPriceAgorot,
    unitPriceFormatted: formatIlsAgorot(line.unitPriceAgorot),
    lineTotalAgorot: line.lineTotalAgorot,
    lineTotalFormatted: formatIlsAgorot(line.lineTotalAgorot),
    adminNote: line.adminNote,
  }));
}

function mapAdditionalLinesToView(
  quote: IProjectQuote,
): QuoteAdditionalLineView[] {
  return quote.additionalLines.map((line) => ({
    label: line.label,
    amountAgorot: line.amountAgorot,
    amountFormatted: formatIlsAgorot(line.amountAgorot),
  }));
}

function mapQuoteTotalsView(quote: IProjectQuote) {
  return mapCalculationToTotalsView({
    lineTotalsAgorot: quote.itemLines.map((line) => line.lineTotalAgorot),
    subtotalAgorot: quote.subtotalAgorot,
    adjustmentsAgorot: quote.adjustmentsAgorot,
    taxableBaseAgorot: quote.taxableBaseAgorot,
    taxAmountAgorot: quote.taxAmountAgorot,
    totalAgorot: quote.totalAgorot,
    vatRateBasisPoints: quote.vatRateBasisPoints,
    taxMode: quote.taxMode,
  });
}

export function mapQuoteToAdminDisplayView(
  quote: IProjectQuote,
): AdminQuoteDisplayView {
  return {
    id: quote._id.toString(),
    version: quote.version,
    status: quote.status,
    statusLabel: getProjectQuoteStatusLabel(quote.status),
    submissionRevision: quote.submissionRevision,
    itemLines: mapItemLinesToView(quote),
    additionalLines: mapAdditionalLinesToView(quote),
    totals: mapQuoteTotalsView(quote),
    generalNote: quote.generalNote,
    validUntil: quote.validUntil?.toISOString(),
    changeRequestMessage: quote.changeRequestMessage,
    sentAt: quote.sentAt?.toISOString(),
    acceptedAt: quote.acceptedAt?.toISOString(),
  };
}

export function mapQuoteToAdminFormView(quote: IProjectQuote): AdminQuoteFormView {
  return {
    quoteId: quote._id.toString(),
    itemLines: quote.itemLines.map((line) => ({
      projectItemId: line.projectItemId.toString(),
      productNameSnapshot: line.productNameSnapshot,
      configurationSummary: line.configurationSummary,
      quantity: line.quantity,
      unitPriceShekels: formatAgorotToShekelsInput(line.unitPriceAgorot),
      adminNote: line.adminNote,
    })),
    additionalLines: quote.additionalLines.map((line) => ({
      label: line.label,
      amountShekels: formatAgorotToShekelsInput(line.amountAgorot),
    })),
    generalNote: quote.generalNote,
    validUntil: quote.validUntil?.toISOString().slice(0, 10),
    totals: mapQuoteTotalsView(quote),
  };
}

export function mapQuoteToAdminHistoryItemView(
  quote: IProjectQuote,
): AdminQuoteHistoryItemView {
  return {
    id: quote._id.toString(),
    version: quote.version,
    status: quote.status,
    statusLabel: getProjectQuoteStatusLabel(quote.status),
    totalFormatted: formatIlsAgorot(quote.totalAgorot),
    sentAt: quote.sentAt?.toISOString(),
    supersededAt: quote.supersededAt?.toISOString(),
  };
}

export function mapQuoteToProfessionalDisplayView(
  quote: IProjectQuote,
  projectSubmissionRevision: number,
): ProfessionalQuoteDisplayView {
  const revisionMatches = quote.submissionRevision === projectSubmissionRevision;

  return {
    id: quote._id.toString(),
    version: quote.version,
    status: quote.status,
    statusLabel: getProjectQuoteStatusLabel(quote.status),
    itemLines: mapItemLinesToView(quote),
    additionalLines: mapAdditionalLinesToView(quote),
    totals: mapQuoteTotalsView(quote),
    generalNote: quote.generalNote,
    validUntil: quote.validUntil?.toISOString(),
    sentAt: quote.sentAt?.toISOString(),
    canAccept: revisionMatches && quote.status === "sent",
    canRequestChange: revisionMatches && quote.status === "sent",
  };
}

export function mapQuoteToProfessionalHistoryItemView(
  quote: IProjectQuote,
): ProfessionalQuoteHistoryItemView {
  return {
    id: quote._id.toString(),
    version: quote.version,
    status: quote.status,
    statusLabel: getProjectQuoteStatusLabel(quote.status),
    totalFormatted: formatIlsAgorot(quote.totalAgorot),
    sentAt: quote.sentAt?.toISOString(),
  };
}

export function mapCalculationToQuoteDocumentFields(
  calculation: QuoteCalculationResult,
  itemLines: Array<{
    projectItemId: string;
    productId: string;
    productNameSnapshot: string;
    skuSnapshot?: string;
    configurationSummary: string;
    quantity: number;
    unitPriceAgorot: number;
    adminNote?: string;
  }>,
  additionalLines: Array<{ label: string; amountAgorot: number }>,
) {
  return {
    itemLines: itemLines.map((line, index) => ({
      projectItemId: line.projectItemId,
      productId: line.productId,
      productNameSnapshot: line.productNameSnapshot,
      skuSnapshot: line.skuSnapshot,
      configurationSummary: line.configurationSummary,
      quantity: line.quantity,
      unitPriceAgorot: line.unitPriceAgorot,
      lineTotalAgorot: calculation.lineTotalsAgorot[index] ?? 0,
      adminNote: line.adminNote,
    })),
    additionalLines,
    subtotalAgorot: calculation.subtotalAgorot,
    adjustmentsAgorot: calculation.adjustmentsAgorot,
    taxableBaseAgorot: calculation.taxableBaseAgorot,
    taxAmountAgorot: calculation.taxAmountAgorot,
    totalAgorot: calculation.totalAgorot,
    taxMode: calculation.taxMode,
    vatRateBasisPoints: calculation.vatRateBasisPoints,
  };
}
