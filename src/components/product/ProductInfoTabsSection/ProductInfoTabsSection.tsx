"use client";

import { useMemo } from "react";
import Tabs from "@/components/ui/Tabs/Tabs";
import TechnicalInfo from "@/components/product/TechnicalInfo/TechnicalInfo";
import {
  getProductInfoTabLabels,
  resolveProductInfoTabId,
  type ProductInfoTabId,
} from "@/lib/products/get-product-detail-tabs";
import type { ProductView } from "@/types/product";
import styles from "./ProductInfoTabsSection.module.scss";

type ProductInfoTabsSectionProps = {
  product: ProductView;
  initialInfoTab?: ProductInfoTabId;
};

export default function ProductInfoTabsSection({
  product,
  initialInfoTab,
}: ProductInfoTabsSectionProps) {
  const tabItems = useMemo(() => {
    const labels = getProductInfoTabLabels(product);

    return labels.map((tab) => ({
      id: tab.id,
      label: tab.label,
      panel:
        tab.id === "details" ? (
          <div className={styles.detailsPanel}>
            <p className={styles.detailsText}>{product.longDescription}</p>
          </div>
        ) : (
          <TechnicalInfo
            product={product}
            variant="embedded"
            hideDimensions
          />
        ),
    }));
  }, [product]);

  if (tabItems.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="מידע נוסף על המוצר">
      <Tabs
        items={tabItems}
        initialTabId={initialInfoTab ?? tabItems[0]?.id}
        ariaLabel="מידע מוצר"
      />
    </section>
  );
}

export function resolveInitialInfoTab(
  requestedTab: string | null,
  product: ProductView,
): ProductInfoTabId | undefined {
  return resolveProductInfoTabId(requestedTab, product);
}
