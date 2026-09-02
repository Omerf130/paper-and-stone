import Link from "next/link";
import {
  buildCatalogHref,
  type CatalogHrefInput,
} from "@/lib/catalog/catalog-params";
import { ChevronDownIcon } from "@/components/Header/icons";
import styles from "./CatalogPagination.module.scss";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  hrefInput?: CatalogHrefInput;
};

export default function CatalogPagination({
  page,
  totalPages,
  hrefInput = {},
}: CatalogPaginationProps) {
  if (totalPages <= 1 || page >= totalPages) {
    return null;
  }

  return (
    <nav aria-label="עמודים" className={styles.nav}>
      <Link
        href={buildCatalogHref({ ...hrefInput, page: page + 1 })}
        className={styles.loadMore}
      >
        <span>טעינת עוד</span>
        <ChevronDownIcon />
      </Link>
    </nav>
  );
}
