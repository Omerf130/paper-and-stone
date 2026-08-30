"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleProductWishlistAction } from "@/app/(public)/products/wishlist-actions";
import { HeartFilledIcon, HeartIcon } from "@/components/ui/icons/ProductActionIcons";
import styles from "./ProductWishlistButton.module.scss";

type ProductWishlistButtonProps = {
  productSlug: string;
  initialIsWishlisted: boolean;
  isAuthenticated: boolean;
  loginHref?: string;
};

export default function ProductWishlistButton({
  productSlug,
  initialIsWishlisted,
  isAuthenticated,
  loginHref,
}: ProductWishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    if (!loginHref) {
      return null;
    }

    return (
      <Link
        href={loginHref}
        className={styles.button}
        aria-label="הוספה למועדפים"
        title="הוספה למועדפים"
      >
        <HeartIcon className={styles.icon} />
      </Link>
    );
  }

  const label = isWishlisted ? "הסרה מהמועדפים" : "הוספה למועדפים";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleProductWishlistAction(productSlug);

      if (result.isWishlisted !== undefined) {
        setIsWishlisted(result.isWishlisted);
      }
    });
  };

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      aria-pressed={isWishlisted}
      title={label}
      disabled={isPending}
      onClick={handleToggle}
    >
      {isWishlisted ? (
        <HeartFilledIcon className={styles.iconActive} />
      ) : (
        <HeartIcon className={styles.icon} />
      )}
    </button>
  );
}
