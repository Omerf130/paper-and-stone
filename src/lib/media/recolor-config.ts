import { Types } from "mongoose";
import type { IProductRecolorConfig } from "@/models/Product";
import type { ProductRecolorConfig } from "@/types/product-recolor";

export function mapRecolorConfigToAdmin(
  config: IProductRecolorConfig | undefined,
): ProductRecolorConfig {
  if (!config) {
    return { enabled: false, status: "missing_primary" };
  }

  return {
    enabled: config.enabled,
    sourceImageMediaId: config.sourceImageMediaId?.toString(),
    status: config.status,
  };
}

export function invalidateRecolorOnPrimaryReplace(
  config: IProductRecolorConfig,
): void {
  config.enabled = false;
  config.status = "invalid_source";
}

export function invalidateRecolorOnPrimaryDelete(
  config: IProductRecolorConfig,
): void {
  config.enabled = false;
  config.status = "missing_primary";
}

export function bindRecolorMaskToPrimary(
  config: IProductRecolorConfig,
  primaryMediaId: Types.ObjectId,
): void {
  config.sourceImageMediaId = primaryMediaId;
  config.status = "ready";
}

export function invalidateRecolorOnMaskDelete(
  config: IProductRecolorConfig,
): void {
  config.enabled = false;
  config.status = "missing_mask";
}

export function syncRecolorStatusFromMedia(
  config: IProductRecolorConfig,
  hasPrimary: boolean,
  hasMask: boolean,
): void {
  if (!hasPrimary) {
    config.status = "missing_primary";
    config.enabled = false;
    return;
  }

  if (!hasMask) {
    if (config.status !== "invalid_source") {
      config.status = "missing_mask";
    }
    config.enabled = false;
    return;
  }

  if (config.status === "missing_primary" || config.status === "missing_mask") {
    config.status = "ready";
  }
}
