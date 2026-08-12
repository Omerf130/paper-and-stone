"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { removeProjectItemAction } from "@/app/professional/projects/actions";
import ProjectItemEditor from "@/components/professional/projects/ProjectItemEditor/ProjectItemEditor";
import { formatProjectItemSummary } from "@/lib/projects/project-display-helpers";
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleRemove = (itemId: string) => {
    if (!window.confirm("להסיר את המוצר מהפרויקט?")) {
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await removeProjectItemAction(projectId, itemId);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (editingItemId === itemId) {
        setEditingItemId(null);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyBlock}>
        <p className={styles.empty}>עדיין לא נוספו מוצרים לפרויקט.</p>
        {!readOnly ? (
          <Link href="/products" className={styles.addLink}>
            הוספת מוצרים
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {items.map((item) => {
        const productView = productViewsById[item.productId];
        const isEditing = editingItemId === item.id;

        return (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.productName}>{item.snapshot.productName}</h3>
                <p className={styles.summary}>
                  {formatProjectItemSummary(item)}
                </p>
                {!item.isProductActive ? (
                  <p className={styles.staleBadge} role="status">
                    המוצר אינו פעיל
                  </p>
                ) : null}
              </div>
              <div className={styles.cardActions}>
                {!readOnly ? (
                  <>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() =>
                        setEditingItemId(isEditing ? null : item.id)
                      }
                      disabled={isPending || !productView}
                    >
                      {isEditing ? "סגירה" : "עריכה"}
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleRemove(item.id)}
                      disabled={isPending}
                    >
                      הסרה
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {isEditing && productView ? (
              <ProjectItemEditor
                projectId={projectId}
                item={item}
                product={productView}
                onSaved={() => setEditingItemId(null)}
              />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
