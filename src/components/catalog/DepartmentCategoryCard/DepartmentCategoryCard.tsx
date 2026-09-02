import Link from "next/link";
import { buildCatalogHref, type CatalogHrefInput } from "@/lib/catalog/catalog-params";
import { formatCategoryProductCountLabel } from "@/lib/catalog/format-category-product-count-label";
import { ArrowRightIcon } from "@/components/Header/icons";
import type { PublicCategoryNavLeafView } from "@/types/public-category-nav";
import styles from "./DepartmentCategoryCard.module.scss";

type DepartmentCategoryCardProps = {
  leaf: PublicCategoryNavLeafView;
  hrefInput?: CatalogHrefInput;
};

export default function DepartmentCategoryCard({
  leaf,
  hrefInput,
}: DepartmentCategoryCardProps) {
  const countLabel = formatCategoryProductCountLabel(leaf.productCount);
  const meta = (
    <div className={styles.metaRow}>
      <div className={styles.metaText}>
        <span className={styles.name}>{leaf.nameHe}</span>
        <span className={styles.count}>{countLabel}</span>
      </div>
      {leaf.isNavigable ? <ArrowRightIcon className={styles.cardArrow} /> : null}
    </div>
  );

  if (leaf.isNavigable && leaf.href) {
    return (
      <Link
        href={buildCatalogHref({
          ...hrefInput,
          categorySlug: leaf.slug,
          page: 1,
          query: null,
          brand: null,
          material: null,
        })}
        className={styles.link}
      >
        <div className={styles.imageArea} aria-hidden="true" />
        <div className={styles.meta}>{meta}</div>
      </Link>
    );
  }

  return (
    <div className={`${styles.link} ${styles.linkDisabled}`} aria-disabled="true">
      <div className={styles.imageArea} aria-hidden="true" />
      <div className={styles.meta}>{meta}</div>
    </div>
  );
}
