"use client";

import type { ReactNode } from "react";
import ProductConfiguratorControls from "@/components/product/ProductConfiguratorControls/ProductConfiguratorControls";
import ProductHero from "@/components/product/ProductHero/ProductHero";
import ProductMedia from "@/components/product/ProductMedia/ProductMedia";
import { useProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";

type ProductConfiguratorProps = {
  product: ProductView;
  identity: ReactNode;
  canAddToProject?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
};

export default function ProductConfigurator({
  product,
  identity,
  canAddToProject = false,
  projectOptions = [],
  profileReady = false,
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
          canAddToProject={canAddToProject}
          projectOptions={projectOptions}
          profileReady={profileReady}
        />
      }
    />
  );
}
