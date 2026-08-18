import { getProjectItemConfigurationRows } from "@/lib/projects/project-display-helpers";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { ProjectItemView } from "@/types/project";
import styles from "./ProfessionalProjectItemRow.module.scss";

type ProfessionalProjectItemRowProps = {
  item: ProjectItemView;
  actions?: React.ReactNode;
  editor?: React.ReactNode;
  showMove?: boolean;
  onMove?: () => void;
};

export default function ProfessionalProjectItemRow({
  item,
  actions,
  editor,
  showMove = false,
  onMove,
}: ProfessionalProjectItemRowProps) {
  const configurationRows = getProjectItemConfigurationRows(item);

  return (
    <article className={styles.row}>
      <div className={styles.identity}>
        <h3 className={styles.productName}>{item.snapshot.productName}</h3>
        {!item.isProductActive ? (
          <StatusBadge tone="warning">המוצר אינו פעיל</StatusBadge>
        ) : null}
      </div>

      <dl className={styles.configuration}>
        {configurationRows.map((row) => (
          <div key={row.label} className={styles.configItem}>
            <dt className={styles.configLabel}>{row.label}</dt>
            <dd className={styles.configValue} dir={row.dir}>
              {row.swatchHex ? (
                <span className={styles.colorValue}>
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: row.swatchHex }}
                    aria-hidden="true"
                  />
                  <span>{row.value}</span>
                </span>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {actions || showMove ? (
        <div className={styles.actions}>
          {showMove && onMove ? (
            <Button variant="ghost" size="sm" onClick={onMove}>
              העברה
            </Button>
          ) : null}
          {actions}
        </div>
      ) : null}
      {editor ? <div className={styles.editorWrap}>{editor}</div> : null}
    </article>
  );
}
