"use client";

import ProductDownloadButton from "@/components/product/ProductDownloadButton/ProductDownloadButton";
import ProductWishlistButton from "@/components/product/ProductWishlistButton/ProductWishlistButton";
import ProductWorkspaceDetailsPanel from "@/components/product/ProductWorkspace/ProductWorkspaceDetailsPanel";
import ProductWorkspaceDrawingPanel from "@/components/product/ProductWorkspace/ProductWorkspaceDrawingPanel";
import ProductWorkspaceProductPanel from "@/components/product/ProductWorkspace/ProductWorkspaceProductPanel";
import ProductWorkspaceTechnicalPanel from "@/components/product/ProductWorkspace/ProductWorkspaceTechnicalPanel";
import Tabs from "@/components/ui/Tabs/Tabs";
import {
  getProductWorkspaceTabLabels,
  type ProductWorkspaceTabId,
} from "@/lib/products/get-product-detail-tabs";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import styles from "./ProductMediaColumn.module.scss";

type ProductMediaColumnProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  isWishlisted: boolean;
  isAuthenticated: boolean;
  loginHref?: string;
  initialWorkspaceTab?: ProductWorkspaceTabId;
};

export default function ProductMediaColumn({
  product,
  state,
  isWishlisted,
  isAuthenticated,
  loginHref,
  initialWorkspaceTab = "product",
}: ProductMediaColumnProps) {
  const labels = getProductWorkspaceTabLabels();
  const tabItems = labels.map((tab) => ({
    id: tab.id,
    label: tab.label,
    panel:
      tab.id === "product" ? (
        <ProductWorkspaceProductPanel product={product} state={state} />
      ) : tab.id === "drawing" ? (
        <ProductWorkspaceDrawingPanel product={product} />
      ) : tab.id === "details" ? (
        <ProductWorkspaceDetailsPanel product={product} />
      ) : (
        <ProductWorkspaceTechnicalPanel product={product} />
      ),
  }));

  const actions = (
    <>
      <ProductWishlistButton
        productSlug={product.slug}
        initialIsWishlisted={isWishlisted}
        isAuthenticated={isAuthenticated}
        loginHref={loginHref}
      />
      <ProductDownloadButton product={product} />
    </>
  );

  return (
    <div className={styles.column}>
      <Tabs
        items={tabItems}
        initialTabId={initialWorkspaceTab}
        actions={actions}
        ariaLabel="תצוגת מוצר"
      />
    </div>
  );
}
