"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteProductAction } from "@/app/admin/products/actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { EditIcon, TrashIcon } from "@/components/ui/icons/admin-icons";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminProductListItem } from "@/types/admin-product";
import styles from "./ProductRowActions.module.scss";

type ProductRowActionsProps = {
  product: AdminProductListItem;
  layout?: "table" | "card";
};

export default function ProductRowActions({
  product,
  layout = "table",
}: ProductRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const editLabel = `עריכת ${product.nameHe}`;
  const deleteLabel = `מחיקת ${product.nameHe}`;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if ("error" in result && result.error) {
        toast({ type: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }

      toast({ type: "success", message: "המוצר נמחק." });
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <div className={layout === "card" ? styles.cardActions : styles.actions}>
        <Link
          href={`/admin/products/${product.id}`}
          className={styles.iconButton}
          aria-label={editLabel}
          title={editLabel}
        >
          <EditIcon className={styles.icon} />
        </Link>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.danger}`}
          aria-label={deleteLabel}
          title={deleteLabel}
          disabled={isPending}
          onClick={() => setConfirmOpen(true)}
        >
          <TrashIcon className={styles.icon} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="מחיקת מוצר"
        description={`למחוק את "${product.nameHe}"? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחיקה"
        tone="danger"
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
