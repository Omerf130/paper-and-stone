export const PROJECT_ITEM_LOGISTICS_STATUSES = [
  "not_ordered",
  "ordered",
  "in_production",
  "ready_at_supplier",
  "shipped",
  "in_transit",
  "customs",
  "warehouse",
  "delivered",
] as const;

export type ProjectItemLogisticsStatus =
  (typeof PROJECT_ITEM_LOGISTICS_STATUSES)[number];

export const PROJECT_ITEM_LOGISTICS_STATUS_LABELS: Record<
  ProjectItemLogisticsStatus,
  string
> = {
  not_ordered: "טרם הוזמן",
  ordered: "הוזמן",
  in_production: "בייצור",
  ready_at_supplier: "מוכן אצל הספק",
  shipped: "יצא למשלוח",
  in_transit: "בדרך",
  customs: "במכס",
  warehouse: "במחסן",
  delivered: "סופק",
};

export const PROJECT_ITEM_LOGISTICS_ERRORS = {
  NOT_FOUND: "המוצר לא נמצא בפרויקט.",
  STATUS_INVALID: "סטטוס הלוגיסטיקה אינו תקין.",
  NOTE_TOO_LONG: "ההערה ארוכה מדי.",
  PROJECT_NOT_FOUND: "הפרויקט לא נמצא.",
} as const;

export const DEFAULT_PROJECT_ITEM_LOGISTICS_STATUS: ProjectItemLogisticsStatus =
  "not_ordered";

export const PROJECT_ITEM_LOGISTICS_NOTE_MAX_LENGTH = 500;

export type ProjectItemLogisticsView = {
  status: ProjectItemLogisticsStatus;
  statusLabel: string;
  note?: string;
  updatedAt?: string;
  updatedByAdminUserId?: string;
  updatedByAdminLabel?: string;
};

export type UpdateProjectItemLogisticsInput = {
  projectId: string;
  itemId: string;
  status: ProjectItemLogisticsStatus;
  note?: string;
};
