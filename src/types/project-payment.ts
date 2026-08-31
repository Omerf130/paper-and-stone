export const PROJECT_PAYMENT_METHODS = [
  "bank_transfer",
  "credit_card",
  "cash",
  "check",
  "other",
] as const;

export type ProjectPaymentMethod = (typeof PROJECT_PAYMENT_METHODS)[number];

export const PROJECT_PAYMENT_METHOD_LABELS: Record<ProjectPaymentMethod, string> = {
  bank_transfer: "העברה בנקאית",
  credit_card: "כרטיס אשראי",
  cash: "מזומן",
  check: "צ'ק",
  other: "אחר",
};

export const PROJECT_PAYMENT_ERRORS = {
  NOT_FOUND: "התשלום לא נמצא.",
  AMOUNT_REQUIRED: "נא להזין סכום תשלום.",
  AMOUNT_INVALID: "סכום התשלום אינו תקין.",
  AMOUNT_MUST_BE_POSITIVE: "סכום התשלום חייב להיות גדול מאפס.",
  DATE_REQUIRED: "נא להזין תאריך תשלום.",
  DATE_INVALID: "תאריך התשלום אינו תקין.",
  METHOD_REQUIRED: "נא לבחור אמצעי תשלום.",
  METHOD_INVALID: "אמצעי התשלום אינו תקין.",
  NOTE_TOO_LONG: "ההערה ארוכה מדי.",
  PROJECT_NOT_FOUND: "הפרויקט לא נמצא.",
} as const;

export type ProjectPaymentInput = {
  projectId: string;
  amountShekels: string;
  paymentDate: string;
  paymentMethod: ProjectPaymentMethod;
  note?: string;
};

export type ProjectPaymentUpdateInput = ProjectPaymentInput & {
  paymentId: string;
};

export type AdminProjectPaymentView = {
  id: string;
  projectId: string;
  amountAgorot: number;
  amountFormatted: string;
  paymentDate: string;
  paymentMethod: ProjectPaymentMethod;
  paymentMethodLabel: string;
  note?: string;
  createdByAdminUserId: string;
  createdByAdminLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectPaymentSummaryView = {
  projectTotalInclVatAgorot?: number;
  projectTotalInclVatFormatted?: string;
  totalPaidAgorot: number;
  totalPaidFormatted: string;
  remainingAgorot?: number;
  remainingFormatted?: string;
  overpaidAgorot?: number;
  overpaidFormatted?: string;
  isOverpaid: boolean;
  isProjectTotalKnown: boolean;
  paymentSummaryCompact?: string;
  commercialTotalIncomplete?: boolean;
  commercialTotalIncompleteMessage?: string;
};
