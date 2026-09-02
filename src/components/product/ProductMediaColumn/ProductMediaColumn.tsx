"use client";

import ProductWorkspaceProductPanel from "@/components/product/ProductWorkspace/ProductWorkspaceProductPanel";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import styles from "./ProductMediaColumn.module.scss";

type ProductMediaColumnProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  showThumbnails?: boolean;
};

export default function ProductMediaColumn({
  product,
  state,
  showThumbnails = true,
}: ProductMediaColumnProps) {
  return (
    <div className={styles.column}>
      <ProductWorkspaceProductPanel
        product={product}
        state={state}
        showThumbnails={showThumbnails}
      />
    </div>
  );
}
