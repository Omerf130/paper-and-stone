"use client";

import ProductDetailLayout from "@/components/product/ProductDetailLayout/ProductDetailLayout";
import { useProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";

type ProductConfiguratorProps = {
  product: ProductView;
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

export default function ProductConfigurator({
  product,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
  isWishlisted = false,
  isAuthenticated = false,
}: ProductConfiguratorProps) {
  const state = useProductConfiguratorState(product);

  return (
    <ProductDetailLayout
      product={product}
      state={state}
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
  );
}
