"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectItemAdminPricingAction } from "@/app/admin/projects/pricing-actions";
import { formatAgorotToShekelsInput } from "@/lib/money/parse-money-input";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import { resolveItemCommercialPricing } from "@/lib/pricing/pricing-commercial-model";
import {
  parseArchitectMarginShareInput,
  parseInternalCostInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import type { AdminProjectItemPricingView } from "@/types/project-pricing";

const VERSION_CONFLICT_MESSAGE =
  "המחיר השתנה מאז פתיחת העמוד. יש לרענן ולנסות שוב.";

type UseAdminItemPricingFormInput = {
  projectId: string;
  itemId: string;
  pricing: AdminProjectItemPricingView;
  isEditable: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
};

export function useAdminItemPricingForm({
  projectId,
  itemId,
  pricing,
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
  const [clientPriceShekels, setClientPriceShekels] = useState(() =>
    pricing.clientPriceAgorot != null
      ? formatAgorotToShekelsInput(pricing.clientPriceAgorot)
      : "",
  );
  const [architectMarkupPercent, setArchitectMarkupPercent] = useState(
    pricing.architectMarkupPercent ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const savedInternalCostShekels =
    pricing.internalCostAgorot != null
      ? formatAgorotToShekelsInput(pricing.internalCostAgorot)
      : "";
  const savedClientPriceShekels =
    pricing.clientPriceAgorot != null
      ? formatAgorotToShekelsInput(pricing.clientPriceAgorot)
      : "";
  const savedArchitectMarkupPercent = pricing.architectMarkupPercent ?? "";

  const isDirty =
    isEditable &&
    (internalCostShekels !== savedInternalCostShekels ||
      clientPriceShekels !== savedClientPriceShekels ||
      architectMarkupPercent !== savedArchitectMarkupPercent);

  const previewResolved = useMemo(() => {
    const internalCostAgorot = parseInternalCostInput(internalCostShekels);
    const clientPriceAgorot = parseInternalCostInput(clientPriceShekels);
    const architectMarkupBp = parseArchitectMarginShareInput(architectMarkupPercent);

    if (
      internalCostAgorot == null ||
      clientPriceAgorot == null ||
      architectMarkupBp == null
    ) {
      return null;
    }

    return resolveItemCommercialPricing({
      internalCostAgorot,
      clientPriceAgorot,
      architectMarkupBp,
    });
  }, [internalCostShekels, clientPriceShekels, architectMarkupPercent]);

  const previewCommercialMarginFormatted =
    previewResolved != null && previewResolved.commercialMarginAgorot >= 0
      ? formatIlsAgorot(previewResolved.commercialMarginAgorot)
      : null;
  const previewPaperStoneProfitFormatted =
    previewResolved != null && previewResolved.paperStoneProfitAgorot >= 0
      ? formatIlsAgorot(previewResolved.paperStoneProfitAgorot)
      : null;
  const previewArchitectProfitFormatted =
    previewResolved != null
      ? formatIlsAgorot(previewResolved.architectProfitAgorot)
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
        clientPriceShekels,
        architectMarkupPercent,
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
    clientPriceShekels,
    setClientPriceShekels,
    architectMarkupPercent,
    setArchitectMarkupPercent,
    fieldErrors,
    isPending,
    isDirty,
    previewCommercialMarginFormatted,
    previewPaperStoneProfitFormatted,
    previewArchitectProfitFormatted,
    handleSave,
    versionConflictMessage: VERSION_CONFLICT_MESSAGE,
  };
}
