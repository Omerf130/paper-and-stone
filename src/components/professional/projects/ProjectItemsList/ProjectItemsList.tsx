"use client";

import { useState, useTransition } from "react";
import { removeProjectItemAction } from "@/app/professional/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import ProjectItemEditor from "@/components/professional/projects/ProjectItemEditor/ProjectItemEditor";
import ProfessionalProjectItemRow from "@/components/professional/projects/ProfessionalProjectItemRow/ProfessionalProjectItemRow";
import type { ProjectItemView } from "@/types/project";
import type { ProductView } from "@/types/product";
import styles from "./ProjectItemsList.module.scss";

type ProjectItemsListProps = {
  projectId: string;
  items: ProjectItemView[];
  productViewsById: Record<string, ProductView>;
  readOnly?: boolean;
};

export default function ProjectItemsList({
  projectId,
  items,
  productViewsById,
  readOnly = false,
}: ProjectItemsListProps) {
  const { toast } = useToast();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const result = await removeProjectItemAction(projectId, itemId);
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
    });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="עדיין לא נוספו מוצרים"
        description="הוסיפו מוצרים מהקטלוג כדי להתחיל לבנות את הפרויקט."
        action={
          !readOnly ? (
            <Button href="/products" variant="secondary" size="sm">
              הוספת מוצרים
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div className={styles.list}>
        {items.map((item) => {
          const productView = productViewsById[item.productId];
          const isEditing = editingItemId === item.id;

          return (
            <ProfessionalProjectItemRow
              key={item.id}
              item={item}
              actions={
                !readOnly ? (
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
                    projectId={projectId}
                    item={item}
                    product={productView}
                    onSaved={() => setEditingItemId(null)}
                  />
                ) : undefined
              }
            />
          );
        })}
      </div>

      {!readOnly ? (
        <div className={styles.footer}>
          <Button href="/products" variant="secondary" size="sm">
            הוספת מוצרים
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={removeItemId !== null}
        title="הסרת מוצר"
        description="להסיר את המוצר מהפרויקט?"
        confirmLabel="הסרה"
        tone="danger"
        loading={isPending}
        onConfirm={() => {
          if (removeItemId) {
            handleRemove(removeItemId);
          }
        }}
        onCancel={() => setRemoveItemId(null)}
      />
    </>
  );
}
