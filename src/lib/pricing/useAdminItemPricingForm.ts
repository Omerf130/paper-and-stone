"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectItemAdminPricingAction } from "@/app/admin/projects/pricing-actions";
import { formatAgorotToShekelsInput } from "@/lib/money/parse-money-input";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import { calculateArchitectPriceAgorot } from "@/lib/pricing/pricing-calculations";
import {
  parseInternalCostInput,
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";

const VERSION_CONFLICT_MESSAGE =
  "המחיר השתנה מאז פתיחת העמוד. יש לרענן ולנסות שוב.";

type UseAdminItemPricingFormInput = {
  projectId: string;
  itemId: string;
  pricing: AdminProjectItemPricingView;
  defaultAdminMarkupPercent?: string;
  isEditable: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
};

export function useAdminItemPricingForm({
  projectId,
  itemId,
  pricing,
  defaultAdminMarkupPercent,
  isEditable,
  onSaveSuccess,
  onSaveError,
}: UseAdminItemPricingFormInput) {
  const router = useRouter();
  const [internalCostShekels, setInternalCostShekels] = useState(() =>
    pricing.internalCostAgorot != null
      ? formatAgorotToShekelsInput(pricing.internalCostAgorot)
      : "",
  );
  const [markupMode, setMarkupMode] = useState<"default" | "override">(
    pricing.usesProjectAdminMarkup ? "default" : "override",
  );
  const [itemMarkupPercent, setItemMarkupPercent] = useState(
    pricing.usesProjectAdminMarkup ? "" : (pricing.adminMarkupPercent ?? ""),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const savedInternalCostShekels =
    pricing.internalCostAgorot != null
      ? formatAgorotToShekelsInput(pricing.internalCostAgorot)
      : "";
  const savedMarkupMode = pricing.usesProjectAdminMarkup ? "default" : "override";
  const savedItemMarkupPercent = pricing.usesProjectAdminMarkup
    ? ""
    : (pricing.adminMarkupPercent ?? "");

  const isDirty =
    isEditable &&
    (internalCostShekels !== savedInternalCostShekels ||
      markupMode !== savedMarkupMode ||
      (markupMode === "override" && itemMarkupPercent !== savedItemMarkupPercent));

  const previewArchitectPrice = useMemo(() => {
    const costAgorot = parseInternalCostInput(internalCostShekels);
    if (costAgorot == null) {
      return null;
    }

    let markupBp: number | null = null;
    if (markupMode === "default") {
      if (defaultAdminMarkupPercent?.trim()) {
        markupBp = parseMarkupPercentageInput(defaultAdminMarkupPercent);
      } else if (pricing.adminMarkupBp != null && pricing.usesProjectAdminMarkup) {
        markupBp = pricing.adminMarkupBp;
      }
    } else if (itemMarkupPercent.trim()) {
      markupBp = parseMarkupPercentageInput(itemMarkupPercent);
    }

    if (markupBp == null) {
      return null;
    }

    return calculateArchitectPriceAgorot(costAgorot, markupBp);
  }, [
    internalCostShekels,
    markupMode,
    itemMarkupPercent,
    defaultAdminMarkupPercent,
    pricing.adminMarkupBp,
    pricing.usesProjectAdminMarkup,
  ]);

  const previewArchitectPriceFormatted =
    previewArchitectPrice != null
      ? formatIlsAgorot(previewArchitectPrice)
      : null;

  const handleSave = () => {
    if (!isDirty) {
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      const result = await setProjectItemAdminPricingAction({
        projectId,
        itemId,
        internalCostShekels,
        useProjectDefaultAdminMarkup: markupMode === "default",
        itemAdminMarkupPercent: markupMode === "override" ? itemMarkupPercent : undefined,
        clearAdminMarkupOverride: markupMode === "default",
        expectedPriceVersion: pricing.priceVersion,
      });

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      if (result.error) {
        const message =
          result.error === PRICING_ERRORS.VERSION_CONFLICT
            ? VERSION_CONFLICT_MESSAGE
            : result.error;
        onSaveError?.(message);
        return;
      }

      onSaveSuccess?.();
      router.refresh();
    });
  };

  return {
    internalCostShekels,
    setInternalCostShekels,
    markupMode,
    setMarkupMode,
    itemMarkupPercent,
    setItemMarkupPercent,
    fieldErrors,
    isPending,
    isDirty,
    previewArchitectPriceFormatted,
    handleSave,
    versionConflictMessage: VERSION_CONFLICT_MESSAGE,
  };
}
