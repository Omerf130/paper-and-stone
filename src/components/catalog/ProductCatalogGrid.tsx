import type { CatalogProductView } from "@/types/catalog";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalogGrid.module.scss";

type ProductCatalogGridProps = {
  products: CatalogProductView[];
};

export default function ProductCatalogGrid({
  products,
}: ProductCatalogGridProps) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.slug} className={styles.item}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
