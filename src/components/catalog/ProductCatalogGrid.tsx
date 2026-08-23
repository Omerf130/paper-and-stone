import type { CatalogProductView } from "@/types/catalog";
import type { CatalogHrefInput } from "@/lib/catalog/catalog-params";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalogGrid.module.scss";

type ProductCatalogGridProps = {
  products: CatalogProductView[];
  hrefInput?: CatalogHrefInput;
};

export default function ProductCatalogGrid({
  products,
  hrefInput,
}: ProductCatalogGridProps) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.slug} className={styles.item}>
          <ProductCard product={product} variant="catalog" hrefInput={hrefInput} />
        </li>
      ))}
    </ul>
  );
}
