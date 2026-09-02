"use client";

import { useState } from "react";
import ProductMediaColumn from "@/components/product/ProductMediaColumn/ProductMediaColumn";
import ProductWorkspaceColumn from "@/components/product/ProductWorkspaceColumn/ProductWorkspaceColumn";
import {
  resolveProductPdpTabId,
  type ProductPdpTabId,
} from "@/lib/products/get-product-detail-tabs";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import { useSearchParams } from "next/navigation";
import styles from "./ProductDetailLayout.module.scss";

type ProductDetailLayoutProps = {
  product: ProductView;
  state: ProductConfiguratorState;
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

export default function ProductDetailLayout({
  product,
  state,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
  isWishlisted = false,
  isAuthenticated = false,
}: ProductDetailLayoutProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const resolvedInitialTab = resolveProductPdpTabId(tabParam, product);
  const [activeTab, setActiveTab] = useState<ProductPdpTabId>(resolvedInitialTab);
  const showThumbnails = activeTab === "overview";

  return (
    <div className={styles.layout}>
      <div className={styles.hero}>
        <ProductMediaColumn
          product={product}
          state={state}
          showThumbnails={showThumbnails}
        />
        <ProductWorkspaceColumn
          product={product}
          state={state}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          catalogContext={catalogContext}
          isApprovedArchitect={isApprovedArchitect}
          isClient={isClient}
          projectOptions={projectOptions}
          profileReady={profileReady}
          loginHref={loginHref}
          registerHref={registerHref}
          isWishlisted={isWishlisted}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
