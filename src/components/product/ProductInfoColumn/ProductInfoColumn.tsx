"use client";

import ProductAddActions from "@/components/product/ProductAddActions/ProductAddActions";
import ProductConfigurationFields from "@/components/product/ProductConfigurationFields/ProductConfigurationFields";
import ProductMetaList from "@/components/product/ProductMetaList/ProductMetaList";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";
import styles from "./ProductInfoColumn.module.scss";

type ProductInfoColumnProps = {
  product: ProductView;
  state: ProductConfiguratorState;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
  part?: "identity" | "purchase" | "all";
};

export default function ProductInfoColumn({
  product,
  state,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
  part = "all",
}: ProductInfoColumnProps) {
  const metaItems = [
    ...(product.brand.trim().length > 0
      ? [{ term: "מותג", value: product.brand }]
      : []),
    ...(product.designer.trim().length > 0
      ? [{ term: "מעצב", value: product.designer }]
      : []),
  ];

  const showAddSection =
    isApprovedArchitect || isClient || Boolean(loginHref);

  const identity = (
    <header className={styles.identity}>
      {product.category ? (
        <p className={styles.category}>{product.category}</p>
      ) : null}
      <h1 className={styles.name}>{product.nameHe}</h1>
      {product.sku ? (
        <p className={styles.sku} dir="ltr">
          {product.sku}
        </p>
      ) : null}
      {product.shortDescription ? (
        <p className={styles.shortDescription}>{product.shortDescription}</p>
      ) : null}
      {metaItems.length > 0 ? (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <ProductMetaList items={metaItems} />
        </>
      ) : null}
    </header>
  );

  const purchase = (
    <div className={styles.purchase}>
      <div className={styles.divider} aria-hidden="true" />
      <ProductConfigurationFields product={product} state={state} />
      {showAddSection ? (
        <ProductAddActions
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
      ) : null}
    </div>
  );

  if (part === "identity") {
    return identity;
  }

  if (part === "purchase") {
    return purchase;
  }

  return (
    <div className={styles.column}>
      {identity}
      {purchase}
    </div>
  );
}
