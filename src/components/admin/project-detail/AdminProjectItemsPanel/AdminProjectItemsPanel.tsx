"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { removeProjectItemAsAdminAction } from "@/app/admin/projects/item-actions";
import { deleteProjectRoomAsAdminAction } from "@/app/admin/projects/room-actions";
import AdminProjectItemManagementRow from "@/components/admin/project-detail/AdminProjectItemManagementRow/AdminProjectItemManagementRow";
import AdminProjectMoveItemDialog from "@/components/admin/project-detail/AdminProjectMoveItemDialog/AdminProjectMoveItemDialog";
import AdminProjectRoomRenameDialog from "@/components/admin/project-detail/AdminProjectRoomRenameDialog/AdminProjectRoomRenameDialog";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ProjectItemView } from "@/types/project";
import type { ProjectRoomView } from "@/types/project-room";
import styles from "./AdminProjectItemsPanel.module.scss";

type AdminProjectItemsPanelProps = {
  projectId: string;
  rooms: ProjectRoomView[];
  items: ProjectItemView[];
  productThumbnailsById: Record<string, ProductThumbnailView>;
  isEditable: boolean;
};

export default function AdminProjectItemsPanel({
  projectId,
  rooms,
  items,
  productThumbnailsById,
  isEditable,
}: AdminProjectItemsPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const baseId = useId();
  const [isPending, startTransition] = useTransition();

  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const itemsByRoomId = groupItemsByRoomId(items);
  const orphanItems = items.filter((item) => !item.roomId);

  const [openRoomIds, setOpenRoomIds] = useState<Set<string>>(() => {
    const initial = sortedRooms[0]?.id;
    return initial ? new Set([initial]) : new Set();
  });
  const [renameRoom, setRenameRoom] = useState<ProjectRoomView | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<ProjectRoomView | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);

  const moveItem = moveItemId
    ? items.find((item) => item.id === moveItemId)
    : null;

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

  const handleDeleteRoom = (room: ProjectRoomView) => {
    startTransition(async () => {
      const result = await deleteProjectRoomAsAdminAction(projectId, room.id);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setDeleteRoom(null);
        return;
      }

      toast({ type: "success", message: "החדר נמחק" });
      setDeleteRoom(null);
      router.refresh();
    });
  };

  const handleRemoveItem = (itemId: string) => {
    startTransition(async () => {
      const result = await removeProjectItemAsAdminAction(projectId, itemId);

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

  const showMove = sortedRooms.length > 0;

  return (
    <div className={styles.panel}>
      {sortedRooms.length > 0 ? (
        <div className={styles.accordion}>
          {sortedRooms.map((room) => {
            const roomItems = itemsByRoomId.get(room.id) ?? [];
            const isOpen = openRoomIds.has(room.id);
            const panelId = `${baseId}-room-${room.id}`;

            return (
              <section key={room.id} className={styles.roomSection}>
                <div className={styles.roomHeaderRow}>
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
                      </span>
                    </span>
                  </button>

                  {isEditable ? (
                    <div className={styles.roomActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRenameRoom(room)}
                      >
                        שינוי שם
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteRoom(room)}
                      >
                        מחיקה
                      </Button>
                    </div>
                  ) : null}
                </div>

                {isOpen ? (
                  <div id={panelId} className={styles.roomPanel}>
                    {roomItems.length > 0 ? (
                      <ul className={styles.itemList}>
                        {roomItems.map((item) => (
                          <li key={item.id}>
                            <AdminProjectItemManagementRow
                              projectId={projectId}
                              item={item}
                              thumbnail={productThumbnailsById[item.productId]}
                              isEditable={isEditable}
                              showMove={showMove}
                              onMove={() => setMoveItemId(item.id)}
                              onRemove={
                                isEditable
                                  ? () => setRemoveItemId(item.id)
                                  : undefined
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptyRoom}>אין מוצרים בחדר זה.</p>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyNotice}>
          אין חדרים בפרויקט. ניתן להוסיף מוצרים ללא שיוך חדר.
        </p>
      )}

      {orphanItems.length > 0 ? (
        <section className={styles.orphanSection} aria-labelledby="admin-orphan-items-title">
          <h3 id="admin-orphan-items-title" className={styles.orphanTitle}>
            מוצרים ללא חדר
          </h3>
          <ul className={styles.itemList}>
            {orphanItems.map((item) => (
              <li key={item.id}>
                <AdminProjectItemManagementRow
                  projectId={projectId}
                  item={item}
                  thumbnail={productThumbnailsById[item.productId]}
                  isEditable={isEditable}
                  showMove={showMove}
                  onMove={() => setMoveItemId(item.id)}
                  onRemove={
                    isEditable ? () => setRemoveItemId(item.id) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {renameRoom ? (
        <AdminProjectRoomRenameDialog
          projectId={projectId}
          roomId={renameRoom.id}
          initialName={renameRoom.name}
          open
          onClose={() => setRenameRoom(null)}
          onRenamed={() => {
            toast({ type: "success", message: "שם החדר עודכן" });
            router.refresh();
          }}
        />
      ) : null}

      {deleteRoom ? (
        <ConfirmDialog
          open
          title="מחיקת חדר"
          description={`למחוק את "${deleteRoom.name}"?`}
          confirmLabel="מחיקה"
          onConfirm={() => handleDeleteRoom(deleteRoom)}
          onCancel={() => setDeleteRoom(null)}
          loading={isPending}
        />
      ) : null}

      {removeItemId ? (
        <ConfirmDialog
          open
          title="הסרת מוצר"
          description="להסיר את המוצר מהפרויקט?"
          confirmLabel="הסרה"
          onConfirm={() => handleRemoveItem(removeItemId)}
          onCancel={() => setRemoveItemId(null)}
          loading={isPending}
        />
      ) : null}

      {moveItem ? (
        <AdminProjectMoveItemDialog
          projectId={projectId}
          itemId={moveItem.id}
          itemName={moveItem.snapshot.productName}
          currentRoomId={moveItem.roomId ?? null}
          rooms={sortedRooms}
          open
          onClose={() => setMoveItemId(null)}
        />
      ) : null}
    </div>
  );
}
