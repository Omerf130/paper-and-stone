"use client";

import Button from "@/components/ui/Button/Button";
import styles from "./AdminProjectItemsToolbar.module.scss";

type AdminProjectItemsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddProduct?: () => void;
};

export default function AdminProjectItemsToolbar({
  searchQuery,
  onSearchChange,
  onAddProduct,
}: AdminProjectItemsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <label className={styles.srOnly} htmlFor="project-items-search">
          חיפוש פריטים
        </label>
        <input
          id="project-items-search"
          type="search"
          className={styles.search}
          placeholder="חיפוש פריטים..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {onAddProduct ? (
        <Button size="sm" onClick={onAddProduct}>
          + הוסף מוצר
        </Button>
      ) : null}
    </div>
  );
}
