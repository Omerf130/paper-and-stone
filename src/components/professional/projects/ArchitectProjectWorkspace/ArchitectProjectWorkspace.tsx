"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeProjectItemAction } from "@/app/professional/projects/actions";
import ArchitectProjectItemCard from "@/components/professional/projects/ArchitectProjectItemCard/ArchitectProjectItemCard";
import ArchitectProjectPricingSettings from "@/components/professional/projects/ArchitectProjectPricingSettings/ArchitectProjectPricingSettings";
import ArchitectProjectRoomAccordion from "@/components/professional/projects/ArchitectProjectRoomAccordion/ArchitectProjectRoomAccordion";
import LayeredPricingTotalsSummary from "@/components/admin/project-detail/LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import ProjectMoveItemDialog from "@/components/professional/projects/ProjectMoveItemDialog/ProjectMoveItemDialog";
import ProjectProductPicker from "@/components/professional/projects/ProjectProductPicker/ProjectProductPicker";
import ProjectRoomCreateDialog from "@/components/professional/projects/ProjectRoomCreateDialog/ProjectRoomCreateDialog";
import { getArchitectPricingAttentionFromItems } from "@/lib/pricing/architect-pricing-attention";
import { getCommercialDirtyLabel } from "@/lib/projects/project-status-presentation";
import { getArchitectProjectAttentionLabels } from "@/lib/projects/architect-project-attention";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectDetailView } from "@/types/project";
import type { ProductView } from "@/types/product";
import styles from "./ArchitectProjectWorkspace.module.scss";

type ArchitectProjectWorkspaceProps = {
  project: ProjectDetailView;
  productViewsById: Record<string, ProductView>;
  productThumbnailsById: Record<string, ProductThumbnailView>;
  readOnly?: boolean;
};

export default function ArchitectProjectWorkspace({
  project,
  productViewsById,
  productThumbnailsById,
  readOnly = false,
}: ArchitectProjectWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [pickerRoomId, setPickerRoomId] = useState<string | null>(null);

  const rooms = project.rooms;
  const isEditable = project.isRoomEditable && !readOnly;
  const pricingSettings = project.pricingSettings!;
  const pricingTotals = project.pricingTotals;
  const attentionLabels = getArchitectProjectAttentionLabels(project);
  const pricingAttention = getArchitectPricingAttentionFromItems(project.items);
  const clientLabel =
    project.assignedClientFullName ?? project.clientName ?? "—";
  const onboardingBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;
  const commercialBadge = mapProjectStatusToBadge(project.status);
  const moveItem = moveItemId
    ? project.items.find((item) => item.id === moveItemId)
    : null;
  const orphanItems = project.items.filter((item) => !item.roomId);

  const handleRemoveItem = (itemId: string) => {
    startTransition(async () => {
      const result = await removeProjectItemAction(project.id, itemId);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setRemoveItemId(null);
        return;
      }

      toast({ type: "success", message: "המוצר הוסר מהפרויקט" });
      setRemoveItemId(null);
      router.refresh();
    });
  };

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.projectName}>{project.name}</h2>
          <p className={styles.clientName}>לקוח: {clientLabel}</p>
          <div className={styles.badges}>
            {onboardingBadge ? (
              <StatusBadge tone={onboardingBadge.tone}>
                {onboardingBadge.label}
              </StatusBadge>
            ) : null}
            <StatusBadge tone={commercialBadge.tone}>
              {commercialBadge.label}
            </StatusBadge>
            {project.status === "approved" && project.commercialDirty ? (
              <StatusBadge tone="warning">
                {getCommercialDirtyLabel("architectWorkspace")}
              </StatusBadge>
            ) : null}
          </div>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>חדרים</dt>
            <dd>{rooms.length}</dd>
          </div>
          <div>
            <dt>מוצרים</dt>
            <dd>{project.items.length}</dd>
          </div>
          <div>
            <dt>עודכן</dt>
            <dd>
              <time dateTime={project.updatedAt}>
                {formatDateTime(project.updatedAt)}
              </time>
            </dd>
          </div>
        </dl>
        {attentionLabels.length > 0 ? (
          <ul className={styles.attentionList} aria-label="דורש טיפול">
            {attentionLabels.map((label) => (
              <li key={label}>
                <StatusBadge tone="warning">{label}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
        {pricingAttention.incompleteItemCount > 0 ||
        pricingAttention.staleClientPriceCount > 0 ? (
          <p className={styles.pricingAttention}>
            {pricingAttention.incompleteItemCount > 0
              ? `${pricingAttention.incompleteItemCount} מוצרים דורשים תמחור ללקוח · `
              : ""}
            {pricingAttention.staleClientPriceCount > 0
              ? `${pricingAttention.staleClientPriceCount} מחירי לקוח דורשים בדיקה`
              : ""}
          </p>
        ) : null}
      </header>

      <ArchitectProjectPricingSettings
        projectId={project.id}
        settings={pricingSettings}
      />

      {rooms.length === 0 ? (
        <EmptyState
          title="התחילו ביצירת החדר הראשון"
          description="ארגנו את המוצרים בפרויקט לפי חדרים — סלון, מטבח, חדר שינה ועוד."
          action={
            isEditable ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
              >
                יצירת חדר ראשון
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {isEditable ? (
            <div className={styles.roomTools}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                disabled={isPending}
              >
                + חדר חדש
              </Button>
            </div>
          ) : null}

          <ArchitectProjectRoomAccordion
            projectId={project.id}
            rooms={rooms}
            items={project.items}
            pricingSettings={pricingSettings}
            productThumbnailsById={productThumbnailsById}
            productViewsById={productViewsById}
            isEditable={isEditable}
            onAddProduct={isEditable ? setPickerRoomId : undefined}
            onMoveItem={setMoveItemId}
            onRemoveItem={setRemoveItemId}
          />

          {pricingTotals ? (
            <LayeredPricingTotalsSummary
              label="סיכום פרויקט"
              variant="project"
              architectTotalFormatted={pricingTotals.architectTotalFormatted}
              clientTotalFormatted={pricingTotals.clientTotalFormatted}
              unpricedItemCount={pricingTotals.unpricedItemCount}
              staleItemCount={pricingTotals.staleItemCount}
              idPrefix="arch-project"
            />
          ) : null}

          {orphanItems.length > 0 ? (
            <section className={styles.orphanSection} aria-labelledby="orphan-items-title">
              <h3 id="orphan-items-title" className={styles.sectionTitle}>
                מוצרים ללא חדר
              </h3>
              <ul className={styles.orphanList}>
                {orphanItems.map((item) =>
                  item.architectPricing ? (
                    <li key={item.id}>
                      <ArchitectProjectItemCard
                        projectId={project.id}
                        item={item}
                        pricing={item.architectPricing}
                        pricingSettings={pricingSettings}
                        thumbnail={productThumbnailsById[item.productId]}
                        productView={productViewsById[item.productId]}
                        isEditable={isEditable}
                        showMove={isEditable && rooms.length > 0}
                        onMove={() => setMoveItemId(item.id)}
                        onRemove={() => setRemoveItemId(item.id)}
                      />
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <ProjectRoomCreateDialog
        projectId={project.id}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => router.refresh()}
      />

      <ConfirmDialog
        open={removeItemId !== null}
        title="הסרת מוצר"
        description="להסיר את המוצר מהפרויקט?"
        confirmLabel="הסרה"
        tone="danger"
        loading={isPending}
        onConfirm={() => {
          if (removeItemId) {
            handleRemoveItem(removeItemId);
          }
        }}
        onCancel={() => setRemoveItemId(null)}
      />

      {moveItem ? (
        <ProjectMoveItemDialog
          projectId={project.id}
          itemId={moveItem.id}
          itemName={moveItem.snapshot.productName}
          currentRoomId={moveItem.roomId ?? rooms[0]?.id ?? ""}
          rooms={rooms}
          open={moveItemId !== null}
          onClose={() => setMoveItemId(null)}
        />
      ) : null}

      {pickerRoomId ? (
        <ProjectProductPicker
          projectId={project.id}
          roomId={pickerRoomId}
          open={pickerRoomId !== null}
          onClose={() => setPickerRoomId(null)}
        />
      ) : null}
    </div>
  );
}
