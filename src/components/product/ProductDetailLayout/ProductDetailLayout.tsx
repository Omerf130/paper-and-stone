"use client";

import { useSearchParams } from "next/navigation";
import ProductInfoColumn from "@/components/product/ProductInfoColumn/ProductInfoColumn";
import ProductMediaColumn from "@/components/product/ProductMediaColumn/ProductMediaColumn";
import { resolveProductWorkspaceTabId } from "@/lib/products/get-product-detail-tabs";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
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
  const workspaceTab = resolveProductWorkspaceTabId(tabParam);

  const sharedInfoProps = {
    product,
    state,
    catalogContext,
    isApprovedArchitect,
    isClient,
    projectOptions,
    profileReady,
    loginHref,
    registerHref,
  };

  return (
    <div className={styles.layout}>
      <div className={styles.hero}>
        <ProductInfoColumn {...sharedInfoProps} part="identity" />
        <ProductMediaColumn
          product={product}
          state={state}
          isWishlisted={isWishlisted}
          isAuthenticated={isAuthenticated}
          loginHref={loginHref}
          initialWorkspaceTab={workspaceTab}
        />
        <ProductInfoColumn {...sharedInfoProps} part="purchase" />
      </div>
    </div>
  );
}
