"use client";

import type { ReactNode } from "react";
import ProductConfiguratorControls from "@/components/product/ProductConfiguratorControls/ProductConfiguratorControls";
import ProductHero from "@/components/product/ProductHero/ProductHero";
import ProductMedia from "@/components/product/ProductMedia/ProductMedia";
import { useProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";

type ProductConfiguratorProps = {
  product: ProductView;
  identity: ReactNode;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
};

export default function ProductConfigurator({
  product,
  identity,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
}: ProductConfiguratorProps) {
  const state = useProductConfiguratorState(product);

  return (
    <ProductHero
      identity={identity}
      media={<ProductMedia product={product} state={state} />}
      controls={
        <ProductConfiguratorControls
          product={product}
          state={state}
          catalogContext={catalogContext}
          isApprovedArchitect={isApprovedArchitect}
          isClient={isClient}
          projectOptions={projectOptions}
          profileReady={profileReady}
          loginHref={loginHref}
          registerHref={registerHref}
        />
      }
    />
  );
}
