export const PROJECT_QUOTE_STATUSES = [
  "draft",
  "sent",
  "change_requested",
  "accepted",
  "superseded",
] as const;

export type ProjectQuoteStatus = (typeof PROJECT_QUOTE_STATUSES)[number];

export const PROJECT_QUOTE_SUPERSEDE_REASONS = [
  "new_version",
  "resubmit",
  "reject",
  "request_changes",
] as const;

export type ProjectQuoteSupersedeReason =
  (typeof PROJECT_QUOTE_SUPERSEDE_REASONS)[number];

export const QUOTE_TAX_MODES = ["exclusive"] as const;

export type QuoteTaxMode = (typeof QUOTE_TAX_MODES)[number];

export const DEFAULT_VAT_RATE_BASIS_POINTS = 1800;

export type QuoteItemLineView = {
  projectItemId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot?: string;
  configurationSummary: string;
  quantity: number;
  unitPriceAgorot: number;
  unitPriceFormatted: string;
  lineTotalAgorot: number;
  lineTotalFormatted: string;
  adminNote?: string;
};

export type QuoteAdditionalLineView = {
  label: string;
  amountAgorot: number;
  amountFormatted: string;
};

export type QuoteTotalsView = {
  subtotalAgorot: number;
  subtotalFormatted: string;
  adjustmentsAgorot: number;
  adjustmentsFormatted: string;
  taxableBaseAgorot: number;
  taxableBaseFormatted: string;
  taxAmountAgorot: number;
  taxAmountFormatted: string;
  totalAgorot: number;
  totalFormatted: string;
  vatRateBasisPoints: number;
  taxMode: QuoteTaxMode;
};

export type AdminQuotePanelView = {
  projectId: string;
  submissionRevision: number;
  canManage: boolean;
  unavailableReason?: string;
  draft: AdminQuoteFormView | null;
  currentQuote: AdminQuoteDisplayView | null;
  previousQuotes: AdminQuoteHistoryItemView[];
  approvalBlockedReason?: string;
  quoteEverSent: boolean;
};

export type AdminQuoteFormView = {
  quoteId: string;
  itemLines: QuoteItemLineInputView[];
  additionalLines: QuoteAdditionalLineInputView[];
  generalNote?: string;
  validUntil?: string;
  totals: QuoteTotalsView;
};

export type QuoteItemLineInputView = {
  projectItemId: string;
  productNameSnapshot: string;
  configurationSummary: string;
  quantity: number;
  unitPriceShekels: string;
  adminNote?: string;
};

export type QuoteAdditionalLineInputView = {
  label: string;
  amountShekels: string;
};

export type AdminQuoteDisplayView = {
  id: string;
  version: number;
  status: ProjectQuoteStatus;
  statusLabel: string;
  submissionRevision: number;
  itemLines: QuoteItemLineView[];
  additionalLines: QuoteAdditionalLineView[];
  totals: QuoteTotalsView;
  generalNote?: string;
  validUntil?: string;
  changeRequestMessage?: string;
  sentAt?: string;
  acceptedAt?: string;
};

export type AdminQuoteHistoryItemView = {
  id: string;
  version: number;
  status: ProjectQuoteStatus;
  statusLabel: string;
  totalFormatted: string;
  sentAt?: string;
  supersededAt?: string;
};

export type ProfessionalQuoteSectionView = {
  projectId: string;
  submissionRevision: number;
  currentQuote: ProfessionalQuoteDisplayView | null;
  previousQuotes: ProfessionalQuoteHistoryItemView[];
  actionHint?: string;
};

export type ProfessionalQuoteDisplayView = {
  id: string;
  version: number;
  status: ProjectQuoteStatus;
  statusLabel: string;
  itemLines: QuoteItemLineView[];
  additionalLines: QuoteAdditionalLineView[];
  totals: QuoteTotalsView;
  generalNote?: string;
  validUntil?: string;
  sentAt?: string;
  canAccept: boolean;
  canRequestChange: boolean;
};

export type ProfessionalQuoteHistoryItemView = {
  id: string;
  version: number;
  status: ProjectQuoteStatus;
  statusLabel: string;
  totalFormatted: string;
  sentAt?: string;
};

export type QuoteActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type SaveQuoteDraftInput = {
  projectId: string;
  itemLines: Array<{
    projectItemId: string;
    unitPriceShekels: string;
    adminNote?: string;
  }>;
  additionalLines: Array<{
    label: string;
    amountShekels: string;
  }>;
  generalNote?: string;
  validUntil?: string;
};

export type SendQuoteInput = SaveQuoteDraftInput;

export type RequestQuoteChangeInput = {
  quoteId: string;
  message: string;
};

export type AdminQuoteAttentionSummary = {
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingProfessionalCount: number;
};

export type AdminProjectQuoteStatusSummary = {
  quoteStatus?: ProjectQuoteStatus;
  quoteStatusLabel?: string;
  quoteAttention?: "accepted" | "change_requested" | "awaiting_professional";
};
