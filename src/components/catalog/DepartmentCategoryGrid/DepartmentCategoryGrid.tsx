import type { CatalogHrefInput } from "@/lib/catalog/catalog-params";
import type { PublicCategoryNavLeafView } from "@/types/public-category-nav";
import DepartmentCategoryCard from "../DepartmentCategoryCard/DepartmentCategoryCard";
import styles from "./DepartmentCategoryGrid.module.scss";

type DepartmentCategoryGridProps = {
  leaves: PublicCategoryNavLeafView[];
  hrefInput?: CatalogHrefInput;
};

export default function DepartmentCategoryGrid({
  leaves,
  hrefInput,
}: DepartmentCategoryGridProps) {
  return (
    <ul className={styles.grid}>
      {leaves.map((leaf) => (
        <li key={leaf.slug} className={styles.item}>
          <DepartmentCategoryCard leaf={leaf} hrefInput={hrefInput} />
        </li>
      ))}
    </ul>
  );
}
