import Link from "next/link";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import type { CatalogProductView } from "@/types/catalog";
import styles from "./ProductCard.module.scss";

type ProductCardProps = {
  product: CatalogProductView;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className={styles.link}>
      <VisualPlaceholder aspectRatio="portrait" className={styles.placeholder} />
      <div className={styles.meta}>
        <span className={styles.name}>{product.nameHe}</span>
        {product.category ? (
          <span className={styles.category}>{product.category}</span>
        ) : null}
        {product.brand ? (
          <span className={styles.brand}>{product.brand}</span>
        ) : null}
      </div>
    </Link>
  );
}
