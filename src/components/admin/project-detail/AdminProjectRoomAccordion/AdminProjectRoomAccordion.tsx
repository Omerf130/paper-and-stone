"use client";

import { useEffect, useId, useState } from "react";
import AdminProjectItemPricingRow from "@/components/admin/project-detail/AdminProjectItemPricingRow/AdminProjectItemPricingRow";
import LayeredPricingTotalsSummary, {
  getRoomClientTotalFormatted,
} from "@/components/admin/project-detail/LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import { getPricingAttentionFromAdminItems } from "@/lib/pricing/pricing-attention-utils";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import type { ProjectRoomView } from "@/types/project-room";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./AdminProjectRoomAccordion.module.scss";

type AdminProjectRoomAccordionProps = {
  projectId: string;
  rooms: ProjectRoomView[];
  items: ProjectItemView[];
  pricingSettings?: ProjectPricingSettingsView;
  productThumbnailsById: Record<string, ProductThumbnailView>;
  defaultOpenRoomId?: string | null;
  singleOpenOnMobile?: boolean;
};

function countRoomAttention(items: ProjectItemView[]) {
  return getPricingAttentionFromAdminItems(items);
}

export default function AdminProjectRoomAccordion({
  projectId,
  rooms,
  items,
  pricingSettings,
  productThumbnailsById,
  defaultOpenRoomId,
  singleOpenOnMobile = true,
}: AdminProjectRoomAccordionProps) {
  const { toast } = useToast();
  const baseId = useId();
  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const itemsByRoomId = groupItemsByRoomId(items);
  const showPricing = pricingSettings?.usesLayeredPricing ?? false;
  const isPricingEditable = pricingSettings?.isAdminPricingEditable ?? false;

  const [openRoomIds, setOpenRoomIds] = useState<Set<string>>(() => {
    const initial = defaultOpenRoomId ?? sortedRooms[0]?.id;
    return initial ? new Set([initial]) : new Set();
  });

  useEffect(() => {
    if (!singleOpenOnMobile || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");

    const handleChange = () => {
      if (media.matches && openRoomIds.size > 1) {
        const first = [...openRoomIds][0];
        setOpenRoomIds(first ? new Set([first]) : new Set());
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [openRoomIds, singleOpenOnMobile]);

  const toggleRoom = (roomId: string) => {
    setOpenRoomIds((current) => {
      const next = new Set(current);
      const isOpen = next.has(roomId);

      if (isOpen) {
        next.delete(roomId);
        return next;
      }

      if (singleOpenOnMobile && typeof window !== "undefined" &&
          window.matchMedia("(max-width: 767px)").matches) {
        return new Set([roomId]);
      }

      next.add(roomId);
      return next;
    });
  };

  return (
    <div className={styles.accordion}>
      {sortedRooms.map((room) => {
        const roomItems = itemsByRoomId.get(room.id) ?? [];
        const isOpen = openRoomIds.has(room.id);
        const panelId = `${baseId}-room-${room.id}`;
        const attention = countRoomAttention(roomItems);
        const incompleteCount = attention.incompleteItemCount;
        const clientTotal = getRoomClientTotalFormatted(roomItems);

        return (
          <section key={room.id} className={styles.roomSection}>
            <button
              type="button"
              className={styles.roomHeader}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleRoom(room.id)}
            >
              <span className={styles.chevron} aria-hidden="true">
                {isOpen ? "▾" : "◂"}
              </span>
              <span className={styles.roomTitleWrap}>
                <span className={styles.roomName}>{room.name}</span>
                <span className={styles.roomMeta}>
                  {room.itemCount === 1 ? "1 מוצר" : `${room.itemCount} מוצרים`}
                  {clientTotal ? ` · ${clientTotal}` : ""}
                  {incompleteCount > 0
                    ? ` · ${incompleteCount === 1 ? "1 מוצר ללא תמחור מלא" : `${incompleteCount} מוצרים ללא תמחור מלא`}`
                    : ""}
                  {attention.needsReviewItemCount > 0
                    ? ` · ${attention.needsReviewItemCount} מוצרים דורשים בדיקת תמחור`
                    : ""}
                </span>
              </span>
            </button>

            {isOpen ? (
              <div id={panelId} className={styles.roomPanel}>
                {roomItems.length > 0 ? (
                  <ul className={styles.itemList}>
                    {roomItems.map((item) => (
                      <li key={item.id}>
                        {showPricing && item.adminPricing ? (
                          <AdminProjectItemPricingRow
                            projectId={projectId}
                            item={{ ...item, adminPricing: item.adminPricing }}
                            isEditable={isPricingEditable}
                            thumbnail={productThumbnailsById[item.productId]}
                            onSaveSuccess={() =>
                              toast({ type: "success", message: "התמחור נשמר" })
                            }
                            onSaveError={(message) =>
                              toast({ type: "error", message })
                            }
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyRoom}>אין מוצרים בחדר זה.</p>
                )}

                {showPricing && roomItems.length > 0 ? (
                  <LayeredPricingTotalsSummary
                    label={`סיכום חדר — ${room.name}`}
                    clientSubtotalFormatted={clientTotal}
                    unpricedItemCount={incompleteCount}
                    needsReviewItemCount={attention.needsReviewItemCount}
                    idPrefix={`room-${room.id}`}
                  />
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
