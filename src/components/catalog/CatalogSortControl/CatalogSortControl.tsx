"use client";

import { useRouter } from "next/navigation";
import {
  buildCatalogHref,
  type CatalogHrefInput,
  type CatalogSort,
} from "@/lib/catalog/catalog-params";
import { ChevronDownIcon } from "@/components/Header/icons";
import styles from "./CatalogSortControl.module.scss";

type CatalogSortControlProps = {
  sort: CatalogSort;
  hrefInput: CatalogHrefInput;
};

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "name-asc", label: "שם (א-ת)" },
  { value: "name-desc", label: "שם (ת-א)" },
];

export default function CatalogSortControl({
  sort,
  hrefInput,
}: CatalogSortControlProps) {
  const router = useRouter();

  return (
    <label className={styles.control}>
      <span className={styles.label}>מיון</span>
      <span className={styles.selectWrap}>
        <select
          className={styles.select}
          value={sort}
          aria-label="מיון מוצרים"
          onChange={(event) => {
            router.push(
              buildCatalogHref({
                ...hrefInput,
                sort: event.target.value as CatalogSort,
                page: 1,
              }),
            );
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className={styles.icon} />
      </span>
    </label>
  );
}
