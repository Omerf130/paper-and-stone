"use client";

import { useMemo, useState } from "react";
import AdminProjectLogisticsFilters, {
  matchesLogisticsFilters,
  type AdminProjectLogisticsFilterState,
} from "@/components/admin/project-detail/AdminProjectLogisticsTab/AdminProjectLogisticsFilters";
import AdminProjectLogisticsRow from "@/components/admin/project-detail/AdminProjectLogisticsTab/AdminProjectLogisticsRow";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectLogisticsTab.module.scss";

type AdminProjectLogisticsTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

const DEFAULT_FILTERS: AdminProjectLogisticsFilterState = {
  roomId: "",
  supplierName: "",
  status: "",
  search: "",
};

export default function AdminProjectLogisticsTab({
  project,
}: AdminProjectLogisticsTabProps) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const roomNameById = useMemo(
    () => new Map(project.rooms.map((room) => [room.id, room.name])),
    [project.rooms],
  );

  const supplierOptions = useMemo(() => {
    const names = new Set<string>();
    for (const item of project.items) {
      if (item.supplierName) {
        names.add(item.supplierName);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, "he"));
  }, [project.items]);

  const filteredItems = useMemo(
    () => project.items.filter((item) => matchesLogisticsFilters(item, filters)),
    [project.items, filters],
  );

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <h2 className={styles.title}>ייבוא ולוגיסטיקה</h2>
        <p className={styles.subtitle}>
          מעקב אחר הזמנות, סטטוס ייצור ומשלוחים — לא ייבוא קובץ
        </p>
      </header>

      <div className={styles.workspace}>
        <div className={styles.filtersWrap}>
          <AdminProjectLogisticsFilters
            filters={filters}
            roomOptions={project.rooms.map((room) => ({ id: room.id, name: room.name }))}
            supplierOptions={supplierOptions}
            onChange={setFilters}
          />
        </div>

        <div className={styles.tableHeader} aria-hidden="true">
          <span>מוצר</span>
          <span>חדר</span>
          <span>כמות</span>
          <span>ספק</span>
          <span>סטטוס</span>
          <span>עדכון אחרון</span>
          <span>הערה</span>
          <span>פעולות</span>
        </div>

        {filteredItems.length === 0 ? (
          <p className={styles.empty}>לא נמצאו מוצרים לפי הסינון.</p>
        ) : (
          <ul className={styles.list}>
            {filteredItems.map((item) => (
              <li key={item.id}>
                <AdminProjectLogisticsRow
                  projectId={project.id}
                  item={item}
                  roomName={
                    item.roomId ? roomNameById.get(item.roomId) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
