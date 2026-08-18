import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import type { ProjectItemView } from "@/types/project";
import type { ProjectRoomView } from "@/types/project-room";
import AdminProjectItemRow from "../AdminProjectItemRow/AdminProjectItemRow";
import styles from "./AdminProjectRoomsPanel.module.scss";

type AdminProjectRoomsPanelProps = {
  rooms: ProjectRoomView[];
  items: ProjectItemView[];
};

export default function AdminProjectRoomsPanel({
  rooms,
  items,
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

  return (
    <div className={styles.panel}>
      {sortedRooms.map((room) => {
        const roomItems = itemsByRoomId.get(room.id) ?? [];

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
              <ul className={styles.itemList}>
                {roomItems.map((item) => (
                  <li key={item.id}>
                    <AdminProjectItemRow item={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyRoom}>אין מוצרים בחדר זה.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
