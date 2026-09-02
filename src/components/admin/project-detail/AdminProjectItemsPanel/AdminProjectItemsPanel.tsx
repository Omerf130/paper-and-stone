"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { removeProjectItemAsAdminAction } from "@/app/admin/projects/item-actions";
import { deleteProjectRoomAsAdminAction } from "@/app/admin/projects/room-actions";
import AdminProjectItemManagementRow from "@/components/admin/project-detail/AdminProjectItemManagementRow/AdminProjectItemManagementRow";
import AdminProjectItemsTableFooter from "@/components/admin/project-detail/AdminProjectItemsTableFooter/AdminProjectItemsTableFooter";
import AdminProjectItemsToolbar from "@/components/admin/project-detail/AdminProjectItemsToolbar/AdminProjectItemsToolbar";
import AdminProjectMoveItemDialog from "@/components/admin/project-detail/AdminProjectMoveItemDialog/AdminProjectMoveItemDialog";
import AdminProjectRoomRenameDialog from "@/components/admin/project-detail/AdminProjectRoomRenameDialog/AdminProjectRoomRenameDialog";
import AdminProjectRoomSummaryStrip from "@/components/admin/project-detail/AdminProjectRoomSummaryStrip/AdminProjectRoomSummaryStrip";
import AdminProjectRoomToolbar from "@/components/admin/project-detail/AdminProjectRoomToolbar/AdminProjectRoomToolbar";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import tableStyles from "@/components/admin/project-detail/admin-project-items-table.module.scss";
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
  onAddRoom?: () => void;
  onAddProduct?: () => void;
};

type RoomSelection = { kind: "room"; roomId: string } | { kind: "orphan" };

function filterItemsBySearch(items: ProjectItemView[], query: string): ProjectItemView[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return items;
  }

  return items.filter((item) => {
    const name = item.snapshot.productName.toLowerCase();
    const sku = item.snapshot.sku?.toLowerCase() ?? "";
    return name.includes(trimmed) || sku.includes(trimmed);
  });
}

export default function AdminProjectItemsPanel({
  projectId,
  rooms,
  items,
  productThumbnailsById,
  isEditable,
  onAddRoom,
  onAddProduct,
}: AdminProjectItemsPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.order - b.order),
    [rooms],
  );
  const itemsByRoomId = useMemo(() => groupItemsByRoomId(items), [items]);
  const orphanItems = useMemo(
    () => items.filter((item) => !item.roomId),
    [items],
  );

  const [selection, setSelection] = useState<RoomSelection>(() => {
    if (sortedRooms[0]) {
      return { kind: "room", roomId: sortedRooms[0].id };
    }

    return { kind: "orphan" };
  });

  const [renameRoom, setRenameRoom] = useState<ProjectRoomView | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<ProjectRoomView | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);

  const selectedRoom =
    selection.kind === "room"
      ? sortedRooms.find((room) => room.id === selection.roomId) ?? null
      : null;

  const visibleItems =
    selection.kind === "room" && selectedRoom
      ? itemsByRoomId.get(selectedRoom.id) ?? []
      : orphanItems;

  const filteredItems = useMemo(
    () => filterItemsBySearch(visibleItems, searchQuery),
    [visibleItems, searchQuery],
  );

  const moveItem = moveItemId
    ? items.find((item) => item.id === moveItemId)
    : null;

  const selectionIndex =
    selection.kind === "room"
      ? sortedRooms.findIndex((room) => room.id === selection.roomId)
      : -1;

  const goToPreviousRoom = () => {
    if (selectionIndex > 0) {
      setSelection({ kind: "room", roomId: sortedRooms[selectionIndex - 1]!.id });
    }
  };

  const goToNextRoom = () => {
    if (selectionIndex >= 0 && selectionIndex < sortedRooms.length - 1) {
      setSelection({ kind: "room", roomId: sortedRooms[selectionIndex + 1]!.id });
    }
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
      <AdminProjectRoomToolbar
        sortedRooms={sortedRooms}
        orphanCount={orphanItems.length}
        selection={selection}
        onSelectionChange={setSelection}
        onPreviousRoom={goToPreviousRoom}
        onNextRoom={goToNextRoom}
        canGoPrevious={selectionIndex > 0}
        canGoNext={selectionIndex >= 0 && selectionIndex < sortedRooms.length - 1}
        onAddRoom={isEditable ? onAddRoom : undefined}
      />

      <AdminProjectRoomSummaryStrip
        room={selectedRoom}
        items={visibleItems}
        isEditable={isEditable && selection.kind === "room"}
        onRename={selectedRoom && isEditable ? () => setRenameRoom(selectedRoom) : undefined}
        onDelete={selectedRoom && isEditable ? () => setDeleteRoom(selectedRoom) : undefined}
      />

      <AdminProjectItemsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddProduct={isEditable ? onAddProduct : undefined}
      />

      {filteredItems.length > 0 ? (
        <>
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th scope="col">מוצר</th>
                  <th scope="col">פרטים</th>
                  <th scope="col">ספק</th>
                  <th scope="col">כמות</th>
                  <th scope="col">מחיר יחידה</th>
                  <th scope="col">סה״כ</th>
                  <th scope="col">סטטוס</th>
                  <th scope="col">
                    <span className={tableStyles.srOnly}>פעולות</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <AdminProjectItemManagementRow
                    key={item.id}
                    projectId={projectId}
                    item={item}
                    thumbnail={productThumbnailsById[item.productId]}
                    isEditable={isEditable}
                    showMove={showMove}
                    variant="table"
                    onMove={() => setMoveItemId(item.id)}
                    onRemove={
                      isEditable ? () => setRemoveItemId(item.id) : undefined
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          <AdminProjectItemsTableFooter
            visibleCount={filteredItems.length}
            totalCount={visibleItems.length}
            hasSearch={searchQuery.trim().length > 0}
          />
        </>
      ) : (
        <p className={styles.emptyRoom}>
          {visibleItems.length === 0
            ? selection.kind === "room"
              ? "אין מוצרים בחדר זה."
              : "אין מוצרים ללא שיוך חדר."
            : "לא נמצאו פריטים שמתאימים לחיפוש."}
        </p>
      )}

      {sortedRooms.length === 0 && orphanItems.length === 0 ? (
        <p className={styles.emptyNotice}>
          אין מוצרים בפרויקט. הוסיפו מוצרים או צרו חדר חדש.
        </p>
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
