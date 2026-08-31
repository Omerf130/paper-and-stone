"use client";

import {
  PROJECT_ITEM_LOGISTICS_STATUSES,
  PROJECT_ITEM_LOGISTICS_STATUS_LABELS,
  type ProjectItemLogisticsStatus,
} from "@/types/project-item-logistics";
import styles from "./AdminProjectLogisticsFilters.module.scss";

export type AdminProjectLogisticsFilterState = {
  roomId: string;
  supplierName: string;
  status: string;
  search: string;
};

type AdminProjectLogisticsFiltersProps = {
  filters: AdminProjectLogisticsFilterState;
  roomOptions: Array<{ id: string; name: string }>;
  supplierOptions: string[];
  onChange: (filters: AdminProjectLogisticsFilterState) => void;
};

export default function AdminProjectLogisticsFilters({
  filters,
  roomOptions,
  supplierOptions,
  onChange,
}: AdminProjectLogisticsFiltersProps) {
  const update = (patch: Partial<AdminProjectLogisticsFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="logistics-filter-room">
          חדר
        </label>
        <select
          id="logistics-filter-room"
          className={styles.input}
          value={filters.roomId}
          onChange={(event) => update({ roomId: event.target.value })}
        >
          <option value="">כל החדרים</option>
          <option value="__orphan__">ללא חדר</option>
          {roomOptions.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="logistics-filter-supplier">
          ספק
        </label>
        <select
          id="logistics-filter-supplier"
          className={styles.input}
          value={filters.supplierName}
          onChange={(event) => update({ supplierName: event.target.value })}
        >
          <option value="">כל הספקים</option>
          {supplierOptions.map((supplier) => (
            <option key={supplier} value={supplier}>
              {supplier}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="logistics-filter-status">
          סטטוס
        </label>
        <select
          id="logistics-filter-status"
          className={styles.input}
          value={filters.status}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value="">כל הסטטוסים</option>
          {PROJECT_ITEM_LOGISTICS_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROJECT_ITEM_LOGISTICS_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="logistics-filter-search">
          חיפוש
        </label>
        <input
          id="logistics-filter-search"
          type="search"
          className={styles.input}
          placeholder="שם מוצר / מק״ט"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
        />
      </div>
    </div>
  );
}

export function matchesLogisticsFilters(
  item: {
    roomId?: string | null;
    supplierName?: string;
    logistics?: { status: ProjectItemLogisticsStatus };
    snapshot: { productName: string; sku?: string };
  },
  filters: AdminProjectLogisticsFilterState,
): boolean {
  if (filters.roomId) {
    if (filters.roomId === "__orphan__" && item.roomId) {
      return false;
    }
    if (filters.roomId !== "__orphan__" && item.roomId !== filters.roomId) {
      return false;
    }
  }

  if (filters.supplierName && item.supplierName !== filters.supplierName) {
    return false;
  }

  if (filters.status && item.logistics?.status !== filters.status) {
    return false;
  }

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    const haystack = [
      item.snapshot.productName,
      item.snapshot.sku ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}
