import ProductSpecificationTable from "@/components/product/ProductSpecificationTable/ProductSpecificationTable";
import {
  buildProductOverviewDescription,
  buildProductOverviewSpecRows,
} from "@/lib/products/build-product-overview-spec-rows";
import type { ProductView } from "@/types/product";
import styles from "./ProductOverviewPanel.module.scss";

type ProductOverviewPanelProps = {
  product: ProductView;
};

export default function ProductOverviewPanel({ product }: ProductOverviewPanelProps) {
  const description = buildProductOverviewDescription(product);
  const specRows = buildProductOverviewSpecRows(product);

  return (
    <div className={styles.panel}>
      {description ? (
        <p className={styles.description}>{description}</p>
      ) : null}
      <ProductSpecificationTable rows={specRows} />
    </div>
  );
}
