import Link from "next/link";
import Container from "@/components/Container/Container";
import ProductCard from "@/components/catalog/ProductCard";
import type { CatalogProductView } from "@/types/catalog";
import type { PublicHomepageFeaturedProductsSectionView } from "@/types/public-homepage-content";
import styles from "./FeaturedProductsSection.module.scss";

type FeaturedProductsSectionProps = {
  content: PublicHomepageFeaturedProductsSectionView;
  products: CatalogProductView[];
};

export default function FeaturedProductsSection({
  content,
  products,
}: FeaturedProductsSectionProps) {
  const showCta = content.cta.isVisible !== false;

  return (
    <section className={styles.section} aria-labelledby="home-featured-heading">
      <Container variant="wide">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 id="home-featured-heading" className={styles.heading}>
              {content.heading}
            </h2>
          </div>
          {showCta ? (
            <Link href={content.cta.href} className={styles.sectionLink}>
              {content.cta.label}
            </Link>
          ) : null}
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
