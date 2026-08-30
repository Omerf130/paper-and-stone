import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container/Container";
import Section from "@/components/Section/Section";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard/WishlistProductCard";
import { buildLoginHref } from "@/lib/auth/safe-next-url";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getWishlistPageData,
  hasWishlistProducts,
} from "@/lib/wishlist/get-wishlist-page-data";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "מועדפים | Paper & Stone",
  description: "מוצרים שמורים במועדפים",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginHref("/wishlist"));
  }

  const wishlistData = await getWishlistPageData(user.id);

  return (
    <Section>
      <Container>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>מועדפים</h1>
            <p className={styles.description}>
              מוצרים ששמרתם לצפייה מאוחרת.
            </p>
          </div>
          <Button href="/products" variant="ghost" size="sm">
            חזרה למוצרים
          </Button>
        </header>

        {hasWishlistProducts(wishlistData) ? (
          <ul className={styles.grid}>
            {wishlistData.products.map((product) => (
              <li key={product.slug} className={styles.item}>
                <WishlistProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="אין מוצרים שמורים"
            description="הוסיפו מוצרים למועדפים מדף המוצר כדי לראות אותם כאן."
            action={
              <Button href="/products" variant="secondary">
                עיון במוצרים
              </Button>
            }
          />
        )}
      </Container>
    </Section>
  );
}
