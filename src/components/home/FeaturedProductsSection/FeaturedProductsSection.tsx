import Section from "@/components/Section/Section";
import ProductCard from "@/components/catalog/ProductCard";
import type { CatalogProductView } from "@/types/catalog";
import styles from "./FeaturedProductsSection.module.scss";

type FeaturedProductsSectionProps = {
  products: CatalogProductView[];
};

export default function FeaturedProductsSection({
  products,
}: FeaturedProductsSectionProps) {
  return (
    <Section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>מוצרים נבחרים</h2>
      </div>

      <ul className={styles.grid}>
        {products.map((product) => (
          <li key={product.slug} className={styles.item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
