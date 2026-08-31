import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import type { ProjectItemView } from "@/types/project";
import type { ProjectRoomView } from "@/types/project-room";
import type {
  AdminPricingTotalsView,
  ProjectPricingSettingsView,
} from "@/types/project-pricing";
import AdminProjectItemRow from "../AdminProjectItemRow/AdminProjectItemRow";
import AdminProjectItemPricing from "../AdminProjectItemPricing/AdminProjectItemPricing";
import AdminProjectPricingSettings from "../AdminProjectPricingSettings/AdminProjectPricingSettings";
import LayeredPricingTotalsSummary, {
  getRoomClientTotalFormatted,
} from "../LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import styles from "./AdminProjectRoomsPanel.module.scss";

type AdminProjectRoomsPanelProps = {
  projectId: string;
  rooms: ProjectRoomView[];
  items: ProjectItemView[];
  pricingSettings?: ProjectPricingSettingsView;
  pricingTotals?: AdminPricingTotalsView;
};

export default function AdminProjectRoomsPanel({
  projectId,
  rooms,
  items,
  pricingSettings,
  pricingTotals,
}: AdminProjectRoomsPanelProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        title="אין חדרים בפרויקט"
        description="הפרויקט נשלח ללא חדרים מוגדרים."
      />
    );
  }

  const itemsByRoomId = groupItemsByRoomId(items);
  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const showPricing = pricingSettings?.usesLayeredPricing ?? false;
  const isPricingEditable = pricingSettings?.isAdminPricingEditable ?? false;

  return (
    <div className={styles.panel}>
      {showPricing && pricingSettings ? (
        <AdminProjectPricingSettings
          projectId={projectId}
          settings={pricingSettings}
        />
      ) : null}

      {sortedRooms.map((room) => {
        const roomItems = itemsByRoomId.get(room.id) ?? [];
        const roomClientTotal = getRoomClientTotalFormatted(roomItems);

        return (
          <section
            key={room.id}
            className={styles.room}
            aria-labelledby={`room-${room.id}-title`}
          >
            <header className={styles.roomHeader}>
              <h3 id={`room-${room.id}-title`} className={styles.roomName}>
                {room.name}
              </h3>
              <span className={styles.roomCount}>
                {room.itemCount} מוצרים
              </span>
            </header>

            {roomItems.length > 0 ? (
              <>
                <ul className={styles.itemList}>
                  {roomItems.map((item) => (
                    <li key={item.id} className={styles.itemEntry}>
                      <AdminProjectItemRow item={item} />
                      {showPricing && item.adminPricing ? (
                        <AdminProjectItemPricing
                          projectId={projectId}
                          itemId={item.id}
                          pricing={item.adminPricing}
                          isEditable={isPricingEditable}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
                {showPricing && roomClientTotal ? (
                  <LayeredPricingTotalsSummary
                    label={`סיכום חדר — ${room.name}`}
                    clientSubtotalFormatted={roomClientTotal}
                    idPrefix={`room-${room.id}`}
                  />
                ) : null}
              </>
            ) : (
              <p className={styles.emptyRoom}>אין מוצרים בחדר זה.</p>
            )}
          </section>
        );
      })}

      {showPricing && pricingTotals ? (
        <LayeredPricingTotalsSummary
          label="סיכום פרויקט"
          internalCostTotalFormatted={pricingTotals.internalCostTotalFormatted}
          commercialMarginTotalFormatted={
            pricingTotals.commercialMarginTotalFormatted
          }
          paperStoneProfitTotalFormatted={
            pricingTotals.paperStoneProfitTotalFormatted
          }
          architectProfitTotalFormatted={
            pricingTotals.architectProfitTotalFormatted
          }
          clientSubtotalFormatted={pricingTotals.clientSubtotalFormatted}
          vatAmountFormatted={pricingTotals.vatAmountFormatted}
          clientTotalInclVatFormatted={pricingTotals.clientTotalInclVatFormatted}
          unpricedItemCount={pricingTotals.unpricedItemCount}
          needsReviewItemCount={pricingTotals.needsReviewItemCount}
          idPrefix="project"
          variant="project"
        />
      ) : null}
    </div>
  );
}
