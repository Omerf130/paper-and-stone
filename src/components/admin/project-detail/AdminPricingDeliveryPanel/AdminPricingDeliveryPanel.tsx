"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deliverAdminPricingRoundAction } from "@/app/admin/projects/pricing-delivery-actions";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminPricingRoundPresentation } from "@/lib/pricing/admin-pricing-round-presentation";
import styles from "./AdminPricingDeliveryPanel.module.scss";

type AdminPricingDeliveryPanelProps = {
  projectId: string;
  pricingRound: AdminPricingRoundPresentation;
};

export default function AdminPricingDeliveryPanel({
  projectId,
  pricingRound,
}: AdminPricingDeliveryPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  if (
    !pricingRound.hasPendingAdminPricingDelivery &&
    pricingRound.adminPricingDeliveredRevision === 0
  ) {
    return null;
  }

  const handleDeliver = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deliverAdminPricingRoundAction({
        projectId,
        expectedAdminPricingRevision: pricingRound.adminPricingRevision,
      });

      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "התמחור נשלח לאדריכל" });
      router.refresh();
    });
  };

  return (
    <section className={styles.panel} aria-labelledby="admin-pricing-delivery-title">
      <h3 id="admin-pricing-delivery-title" className={styles.title}>
        שליחת תמחור לאדריכל
      </h3>
      <p className={styles.message}>{pricingRound.statusMessage}</p>
      {pricingRound.showDeliveryButton ? (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDeliver}
            loading={isPending}
            loadingLabel="שולח..."
            disabled={isPending}
          >
            אישור תמחור ושליחה לאדריכל
          </Button>
        </div>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
