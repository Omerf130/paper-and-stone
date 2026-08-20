"use client";

import { useId, useState } from "react";
import ClientProjectItemCard from "@/components/client/ClientProjectItemCard/ClientProjectItemCard";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { ClientApprovedProjectRoomView } from "@/types/client-approved-project";
import styles from "./ClientProjectRoomAccordion.module.scss";

type ClientProjectRoomAccordionProps = {
  rooms: ClientApprovedProjectRoomView[];
  defaultOpenRoomId?: string | null;
};

export default function ClientProjectRoomAccordion({
  rooms,
  defaultOpenRoomId,
}: ClientProjectRoomAccordionProps) {
  const baseId = useId();
  const [openRoomId, setOpenRoomId] = useState<string | null>(
    defaultOpenRoomId ?? rooms[0]?.roomId ?? null,
  );

  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.accordion}>
      {sortedRooms.map((room) => {
        const isOpen = openRoomId === room.roomId;
        const panelId = `${baseId}-${room.roomId}`;

        return (
          <section key={room.roomId} className={styles.roomSection}>
            <button
              type="button"
              className={styles.roomHeader}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenRoomId(isOpen ? null : room.roomId)
              }
            >
              <span className={styles.chevron} aria-hidden="true">
                {isOpen ? "▾" : "▸"}
              </span>
              <span className={styles.roomTitleWrap}>
                <span className={styles.roomName}>{room.name}</span>
                <span className={styles.roomMeta}>
                  {room.items.length} מוצרים ·{" "}
                  {formatIlsAgorot(room.clientRoomTotalAgorot)}
                </span>
              </span>
            </button>

            {isOpen ? (
              <div id={panelId} className={styles.roomPanel}>
                <ul className={styles.itemList}>
                  {room.items.map((item) => (
                    <li key={item.projectItemId}>
                      <ClientProjectItemCard item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
