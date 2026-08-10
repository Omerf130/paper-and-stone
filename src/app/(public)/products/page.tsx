import type { Metadata } from "next";
import Section from "@/components/Section/Section";
import ProductCatalogGrid from "@/components/catalog/ProductCatalogGrid";
import { getPublicProducts } from "@/lib/products/getPublicProducts";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "מוצרים | Paper & Stone",
  description: "מוצרים פעילים מ-Paper & Stone",
};

export default async function ProductsCatalogPage() {
  const products = await getPublicProducts();

  return (
    <Section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>מוצרים</h1>
        <p className={styles.description}>
          מבחר מוצרים פעילים מ-Paper & Stone.
        </p>
      </header>

      {products.length === 0 ? (
        <p className={styles.empty}>אין מוצרים פעילים להצגה כרגע.</p>
      ) : (
        <ProductCatalogGrid products={products} />
      )}
    </Section>
  );
}
