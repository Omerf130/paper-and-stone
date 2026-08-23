"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { removeProjectItemAction } from "@/app/professional/projects/actions";
import {
  deleteProjectRoomAction,
  reorderProjectRoomsAction,
} from "@/app/professional/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import ProjectItemEditor from "@/components/professional/projects/ProjectItemEditor/ProjectItemEditor";
import ProfessionalProjectItemRow from "@/components/professional/projects/ProfessionalProjectItemRow/ProfessionalProjectItemRow";
import ArchitectProjectPricingSettings from "@/components/professional/projects/ArchitectProjectPricingSettings/ArchitectProjectPricingSettings";
import ArchitectProjectItemPricing from "@/components/professional/projects/ArchitectProjectItemPricing/ArchitectProjectItemPricing";
import { buildCatalogHref } from "@/lib/catalog/catalog-params";
import ProjectMoveItemDialog from "@/components/professional/projects/ProjectMoveItemDialog/ProjectMoveItemDialog";
import ProjectRoomCreateDialog from "@/components/professional/projects/ProjectRoomCreateDialog/ProjectRoomCreateDialog";
import ProjectRoomNav from "@/components/professional/projects/ProjectRoomNav/ProjectRoomNav";
import ProjectRoomRenameDialog from "@/components/professional/projects/ProjectRoomRenameDialog/ProjectRoomRenameDialog";
import type { ProjectDetailView } from "@/types/project";
import type { ProjectRoomView } from "@/types/project-room";
import type { ProductView } from "@/types/product";
import styles from "./ProjectRoomWorkspace.module.scss";

type ProjectRoomWorkspaceProps = {
  project: ProjectDetailView;
  productViewsById: Record<string, ProductView>;
  readOnly?: boolean;
};

export default function ProjectRoomWorkspace({
  project,
  productViewsById,
  readOnly = false,
}: ProjectRoomWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameRoom, setRenameRoom] = useState<ProjectRoomView | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<ProjectRoomView | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);

  const rooms = project.rooms;
  const urlRoomId = searchParams.get("room");
  const selectedRoomId = useMemo(() => {
    if (urlRoomId && rooms.some((room) => room.id === urlRoomId)) {
      return urlRoomId;
    }

    if (
      project.selectedRoomId &&
      rooms.some((room) => room.id === project.selectedRoomId)
    ) {
      return project.selectedRoomId;
    }

    return rooms[0]?.id ?? null;
  }, [urlRoomId, rooms, project.selectedRoomId]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const roomItems = useMemo(
    () =>
      selectedRoomId
        ? project.items.filter((item) => item.roomId === selectedRoomId)
        : [],
    [project.items, selectedRoomId],
  );
  const moveItem = moveItemId
    ? project.items.find((item) => item.id === moveItemId)
    : null;
  const isEditable = project.isRoomEditable && !readOnly;
  const showPricing = project.pricingSettings?.usesLayeredPricing ?? false;
  const isPricingEditable = project.pricingSettings?.isArchitectPricingEditable ?? false;

  const selectRoom = (roomId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("room", roomId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRoomCreated = (roomId: string) => {
    if (roomId) {
      selectRoom(roomId);
    }
    router.refresh();
  };

  const handleMoveRoom = (roomId: string, direction: "up" | "down") => {
    const index = rooms.findIndex((room) => room.id === roomId);
    if (index < 0) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rooms.length) {
      return;
    }

    const reordered = [...rooms];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    startTransition(async () => {
      const result = await reorderProjectRoomsAction(
        project.id,
        reordered.map((room) => room.id),
      );

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      router.refresh();
    });
  };

  const handleDeleteRoom = () => {
    if (!deleteRoom) {
      return;
    }

    const deletedRoomId = deleteRoom.id;

    startTransition(async () => {
      const result = await deleteProjectRoomAction(project.id, deletedRoomId);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setDeleteRoom(null);
        return;
      }

      toast({ type: "success", message: "החדר נמחק" });

      if (selectedRoomId === deletedRoomId) {
        const remaining = rooms.filter((room) => room.id !== deletedRoomId);
        if (remaining[0]) {
          selectRoom(remaining[0].id);
        } else {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("room");
          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          });
        }
      }

      setDeleteRoom(null);
      router.refresh();
    });
  };

  const handleRemoveItem = (itemId: string) => {
    startTransition(async () => {
      const result = await removeProjectItemAction(project.id, itemId);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setRemoveItemId(null);
        return;
      }

      toast({ type: "success", message: "המוצר הוסר מהפרויקט" });
      if (editingItemId === itemId) {
        setEditingItemId(null);
      }
      setRemoveItemId(null);
      router.refresh();
    });
  };

  if (rooms.length === 0) {
    return (
      <>
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

        <ProjectRoomCreateDialog
          projectId={project.id}
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreated={handleRoomCreated}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.workspace}>
        <aside className={styles.navColumn}>
          <ProjectRoomNav
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            isEditable={isEditable}
            disabled={isPending}
            onSelectRoom={selectRoom}
            onMoveUp={(roomId) => handleMoveRoom(roomId, "up")}
            onMoveDown={(roomId) => handleMoveRoom(roomId, "down")}
            onRename={setRenameRoom}
            onDelete={setDeleteRoom}
            onCreateRoom={() => setCreateDialogOpen(true)}
          />
        </aside>

        <section className={styles.itemsColumn} aria-label="מוצרים בחדר">
          {showPricing && project.pricingSettings ? (
            <ArchitectProjectPricingSettings
              projectId={project.id}
              settings={project.pricingSettings}
            />
          ) : null}

          {selectedRoom ? (
            <header className={styles.roomHeader}>
              <h3 className={styles.roomTitle}>{selectedRoom.name}</h3>
              {isEditable && selectedRoomId ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={buildCatalogHref({
                    projectId: project.id,
                    roomId: selectedRoomId,
                  })}
                  disabled={isPending}
                >
                  + הוספת מוצר
                </Button>
              ) : null}
            </header>
          ) : null}

          {roomItems.length === 0 ? (
            <EmptyState
              title="אין מוצרים בחדר זה"
              description="הוסיפו מוצרים לחדר כדי להמשיך לבנות את הפרויקט."
              action={
                isEditable && selectedRoomId ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    href={buildCatalogHref({
                      projectId: project.id,
                      roomId: selectedRoomId,
                    })}
                  >
                    + הוספת מוצר
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className={styles.list}>
              {roomItems.map((item) => {
                const productView = productViewsById[item.productId];
                const isEditing = editingItemId === item.id;

                return (
                  <div key={item.id} className={styles.itemBlock}>
                    <ProfessionalProjectItemRow
                      item={item}
                      showMove={isEditable && rooms.length > 1}
                      onMove={() => setMoveItemId(item.id)}
                      actions={
                        isEditable ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setEditingItemId(isEditing ? null : item.id)
                              }
                              disabled={isPending || !productView}
                            >
                              {isEditing ? "סגירה" : "עריכה"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemoveItemId(item.id)}
                              disabled={isPending}
                            >
                              הסרה
                            </Button>
                          </>
                        ) : undefined
                      }
                      editor={
                        isEditing && productView ? (
                          <ProjectItemEditor
                            projectId={project.id}
                            item={item}
                            product={productView}
                            onSaved={() => setEditingItemId(null)}
                          />
                        ) : undefined
                      }
                    />
                    {showPricing && item.architectPricing ? (
                      <ArchitectProjectItemPricing
                        projectId={project.id}
                        itemId={item.id}
                        pricing={item.architectPricing}
                        defaultArchitectMarkupPercent={
                          project.pricingSettings?.defaultArchitectMarkupPercent
                        }
                        isEditable={isPricingEditable && !readOnly}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ProjectRoomCreateDialog
        projectId={project.id}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleRoomCreated}
      />

      {renameRoom ? (
        <ProjectRoomRenameDialog
          projectId={project.id}
          roomId={renameRoom.id}
          initialName={renameRoom.name}
          open={renameRoom !== null}
          onClose={() => setRenameRoom(null)}
          onRenamed={() => router.refresh()}
        />
      ) : null}

      <ConfirmDialog
        open={deleteRoom !== null}
        title="מחיקת חדר"
        description={
          deleteRoom
            ? `למחוק את "${deleteRoom.name}"? ניתן למחוק רק חדרים ללא מוצרים.`
            : ""
        }
        confirmLabel="מחיקה"
        tone="danger"
        loading={isPending}
        onConfirm={handleDeleteRoom}
        onCancel={() => setDeleteRoom(null)}
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

      {moveItem && selectedRoomId ? (
        <ProjectMoveItemDialog
          projectId={project.id}
          itemId={moveItem.id}
          itemName={moveItem.snapshot.productName}
          currentRoomId={selectedRoomId}
          rooms={rooms}
          open={moveItemId !== null}
          onClose={() => setMoveItemId(null)}
        />
      ) : null}
    </>
  );
}
