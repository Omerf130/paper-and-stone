"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeProductFromWishlistAction } from "@/app/(public)/products/wishlist-actions";
import ProductCard from "@/components/catalog/ProductCard";
import type { CatalogProductView } from "@/types/catalog";
import styles from "./WishlistProductCard.module.scss";

type WishlistProductCardProps = {
  product: CatalogProductView;
};

export default function WishlistProductCard({ product }: WishlistProductCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      await removeProductFromWishlistAction(product.slug);
      router.refresh();
    });
  };

  return (
    <article className={styles.card}>
      <ProductCard product={product} variant="catalog" />
      <button
        type="button"
        className={styles.removeButton}
        onClick={handleRemove}
        disabled={isPending}
        aria-label={`הסרת ${product.nameHe} מהמועדפים`}
      >
        {isPending ? "מסיר..." : "הסרה מהמועדפים"}
      </button>
    </article>
  );
}
