"use client";

import { useMemo } from "react";
import ProductActionBar from "@/components/product/ProductActionBar/ProductActionBar";
import ProductConfigurationFields from "@/components/product/ProductConfigurationFields/ProductConfigurationFields";
import ProductDimensionsWorkspacePanel from "@/components/product/ProductDimensionsWorkspacePanel/ProductDimensionsWorkspacePanel";
import ProductOverviewPanel from "@/components/product/ProductOverviewPanel/ProductOverviewPanel";
import ProductPdpHeader from "@/components/product/ProductPdpHeader/ProductPdpHeader";
import ProductSelectionSummary from "@/components/product/ProductSelectionSummary/ProductSelectionSummary";
import { useProductAddActions } from "@/components/product/useProductAddActions";
import Tabs from "@/components/ui/Tabs/Tabs";
import {
  getProductPdpTabLabels,
  type ProductPdpTabId,
} from "@/lib/products/get-product-detail-tabs";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import styles from "./ProductWorkspaceColumn.module.scss";

type ProductWorkspaceColumnProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  activeTab: ProductPdpTabId;
  onTabChange: (tabId: ProductPdpTabId) => void;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
  isWishlisted?: boolean;
  isAuthenticated?: boolean;
};

export default function ProductWorkspaceColumn({
  product,
  state,
  activeTab,
  onTabChange,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
  isWishlisted = false,
  isAuthenticated = false,
}: ProductWorkspaceColumnProps) {
  const addActions = useProductAddActions({
    product,
    state,
    catalogContext,
    isApprovedArchitect,
    isClient,
    projectOptions,
    profileReady,
    loginHref,
    registerHref,
  });

  const tabItems = useMemo(() => {
    const labels = getProductPdpTabLabels(product);

    return labels.map((tab) => ({
      id: tab.id,
      label: tab.label,
      panel:
        tab.id === "overview" ? (
          <ProductOverviewPanel product={product} />
        ) : tab.id === "configure" ? (
          <div className={styles.configurePanel}>
            <div className={styles.configureMain}>
              <ProductConfigurationFields product={product} state={state} />
            </div>
            <ProductSelectionSummary state={state} variant="sidePanel" />
          </div>
        ) : (
          <ProductDimensionsWorkspacePanel product={product} />
        ),
    }));
  }, [product, state]);

  return (
    <div className={styles.column}>
      <ProductPdpHeader
        product={product}
        isWishlisted={isWishlisted}
        isAuthenticated={isAuthenticated}
        loginHref={loginHref}
      />

      <Tabs
        items={tabItems}
        activeTabId={activeTab}
        onTabChange={(tabId) => onTabChange(tabId as ProductPdpTabId)}
        ariaLabel="מידע מוצר"
        density="compact"
      />

      <ProductActionBar
        product={product}
        state={state}
        addActions={addActions}
      />
    </div>
  );
}
