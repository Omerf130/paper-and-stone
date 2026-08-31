"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/ui/Button/Button";
import { buildCatalogHref } from "@/lib/catalog/catalog-params";
import ArchitectProjectItemCard from "@/components/professional/projects/ArchitectProjectItemCard/ArchitectProjectItemCard";
import LayeredPricingTotalsSummary, {
  getRoomArchitectTotalFormattedFromArchitectItems,
} from "@/components/admin/project-detail/LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import { getArchitectPricingAttentionFromItems } from "@/lib/pricing/architect-pricing-attention";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectDetailView } from "@/types/project";
import type { ProductView } from "@/types/product";
import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./ArchitectProjectRoomAccordion.module.scss";

type ArchitectProjectRoomAccordionProps = {
  projectId: string;
  rooms: ProjectDetailView["rooms"];
  items: ProjectDetailView["items"];
  pricingSettings: ProjectPricingSettingsView;
  productThumbnailsById: Record<string, ProductThumbnailView>;
  productViewsById: Record<string, ProductView>;
  isEditable: boolean;
  onMoveItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  defaultOpenRoomId?: string | null;
};

export default function ArchitectProjectRoomAccordion({
  projectId,
  rooms,
  items,
  pricingSettings,
  productThumbnailsById,
  productViewsById,
  isEditable,
  onMoveItem,
  onRemoveItem,
  defaultOpenRoomId,
}: ArchitectProjectRoomAccordionProps) {
  const baseId = useId();
  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const itemsByRoomId = groupItemsByRoomId(items);
  const showPricing = pricingSettings.usesLayeredPricing;

  const [openRoomIds, setOpenRoomIds] = useState<Set<string>>(() => {
    const initial = defaultOpenRoomId ?? sortedRooms[0]?.id;
    return initial ? new Set([initial]) : new Set();
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const handleChange = () => {
      if (media.matches && openRoomIds.size > 1) {
        const first = [...openRoomIds][0];
        setOpenRoomIds(first ? new Set([first]) : new Set());
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [openRoomIds]);

  const toggleRoom = (roomId: string) => {
    setOpenRoomIds((current) => {
      const next = new Set(current);
      const isOpen = next.has(roomId);

      if (isOpen) {
        next.delete(roomId);
        return next;
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches
      ) {
        return new Set([roomId]);
      }

      next.add(roomId);
      return next;
    });
  };

  const renderAddProductLink = (roomId: string) => (
    <Button
      variant="secondary"
      size="sm"
      href={buildCatalogHref({ projectId, roomId })}
    >
      + הוספת מוצר
    </Button>
  );

  return (
    <div className={styles.accordion}>
      {sortedRooms.map((room) => {
        const roomItems = itemsByRoomId.get(room.id) ?? [];
        const isOpen = openRoomIds.has(room.id);
        const panelId = `${baseId}-room-${room.id}`;
        const attention = getArchitectPricingAttentionFromItems(roomItems);
        const architectProfitTotal =
          getRoomArchitectTotalFormattedFromArchitectItems(roomItems);

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
                  {architectProfitTotal ? ` · ${architectProfitTotal}` : ""}
                  {attention.incompleteItemCount > 0 ? " · תמחור חסר" : ""}
                  {attention.needsReviewItemCount > 0
                    ? ` · ${attention.needsReviewItemCount} דורשים בדיקת תמחור`
                    : ""}
                </span>
              </span>
            </button>

            {isOpen ? (
              <div id={panelId} className={styles.roomPanel}>
                {isEditable ? (
                  <div className={styles.roomActions}>
                    {renderAddProductLink(room.id)}
                  </div>
                ) : null}

                {roomItems.length > 0 ? (
                  <ul className={styles.itemList}>
                    {roomItems.map((item) => (
                      <li key={item.id}>
                        {showPricing && item.architectPricing ? (
                          <ArchitectProjectItemCard
                            projectId={projectId}
                            item={item}
                            pricing={item.architectPricing}
                            thumbnail={productThumbnailsById[item.productId]}
                            productView={productViewsById[item.productId]}
                            isEditable={isEditable}
                            showMove={isEditable && rooms.length > 1}
                            onMove={() => onMoveItem(item.id)}
                            onRemove={() => onRemoveItem(item.id)}
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyRoom}>
                    <p>אין מוצרים בחדר זה.</p>
                    {isEditable ? renderAddProductLink(room.id) : null}
                  </div>
                )}

                {showPricing && roomItems.length > 0 ? (
                  <LayeredPricingTotalsSummary
                    label={`סיכום חדר — ${room.name}`}
                    architectProfitTotalFormatted={architectProfitTotal}
                    unpricedItemCount={attention.incompleteItemCount}
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
