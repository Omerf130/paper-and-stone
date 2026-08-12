export const RECOLOR_STATUSES = [
  "ready",
  "missing_primary",
  "missing_mask",
  "invalid_source",
] as const;

export type RecolorStatus = (typeof RECOLOR_STATUSES)[number];

export type ProductRecolorConfig = {
  enabled: boolean;
  sourceImageMediaId?: string;
  status: RecolorStatus;
};

export const DEFAULT_RECOLOR_CONFIG: ProductRecolorConfig = {
  enabled: false,
  status: "missing_primary",
};
