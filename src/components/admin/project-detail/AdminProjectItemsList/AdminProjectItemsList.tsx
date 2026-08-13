import EmptyState from "@/components/ui/EmptyState/EmptyState";
import type { ProjectItemView } from "@/types/project";
import AdminProjectItemRow from "../AdminProjectItemRow/AdminProjectItemRow";
import styles from "./AdminProjectItemsList.module.scss";

type AdminProjectItemsListProps = {
  items: ProjectItemView[];
};

export default function AdminProjectItemsList({
  items,
}: AdminProjectItemsListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="אין מוצרים בפרויקט"
        description="הפרויקט נשלח ללא מוצרים מוגדרים."
      />
    );
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <AdminProjectItemRow item={item} />
        </li>
      ))}
    </ul>
  );
}
