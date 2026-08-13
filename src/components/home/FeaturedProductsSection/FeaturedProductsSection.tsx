import Link from "next/link";
import Container from "@/components/Container/Container";
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
    <section className={styles.section} aria-labelledby="home-featured-heading">
      <Container variant="wide">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>נבחרים</p>
            <h2 id="home-featured-heading" className={styles.heading}>
              מוצרים נבחרים
            </h2>
          </div>
          <Link href="/products" className={styles.sectionLink}>
            כל המוצרים
          </Link>
        </div>

        <ul className={styles.grid}>
          {products.map((product) => (
            <li key={product.slug} className={styles.item}>
              <ProductCard product={product} variant="featured" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
