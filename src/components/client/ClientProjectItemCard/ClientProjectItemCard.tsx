import Image from "next/image";
import ClientProjectItemWorkflow from "@/components/client/ClientProjectItemWorkflow/ClientProjectItemWorkflow";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { ClientApprovedProjectItemView } from "@/types/client-approved-project";
import type { ClientProjectItemWorkflowStatusView } from "@/types/client-project";
import styles from "./ClientProjectItemCard.module.scss";

type ClientProjectItemCardProps = {
  item: ClientApprovedProjectItemView;
  projectId: string;
  workflow?: ClientProjectItemWorkflowStatusView;
};

function buildConfigurationLines(
  configuration: ClientApprovedProjectItemView["configuration"],
): Array<{ label: string; value: string }> {
  const lines: Array<{ label: string; value: string }> = [];

  if (configuration.material?.trim()) {
    lines.push({ label: "חומר", value: configuration.material.trim() });
  }

  if (configuration.color?.trim()) {
    lines.push({ label: "צבע", value: configuration.color.trim() });
  }

  if (configuration.size?.trim()) {
    lines.push({ label: "מידה", value: configuration.size.trim() });
  }

  return lines;
}

export default function ClientProjectItemCard({
  item,
  projectId,
  workflow,
}: ClientProjectItemCardProps) {
  const configurationLines = buildConfigurationLines(item.configuration);
  const showLineTotal = item.quantity > 1;

  return (
    <article className={styles.card}>
      <div className={styles.mediaColumn}>
        {item.image?.url ? (
          <Image
            src={item.image.url}
            alt={item.image.alt}
            width={96}
            height={96}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            ללא תמונה
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h3 className={styles.name}>{item.productName}</h3>
          <p className={styles.code} dir="ltr">
            {item.productCode}
          </p>
        </div>

        {configurationLines.length > 0 ? (
          <dl className={styles.configuration}>
            {configurationLines.map((line) => (
              <div key={line.label} className={styles.configRow}>
                <dt>{line.label}</dt>
                <dd>{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <dl className={styles.pricing}>
          <div className={styles.pricingRow}>
            <dt>כמות</dt>
            <dd>{item.quantity}</dd>
          </div>

          <div className={styles.pricingRow}>
            <dt>{showLineTotal ? "מחיר ליחידה" : "מחיר"}</dt>
            <dd>{formatIlsAgorot(item.clientUnitPriceAgorot)}</dd>
          </div>

          {showLineTotal ? (
            <div className={styles.pricingRow}>
              <dt>סה״כ</dt>
              <dd className={styles.lineTotal}>
                {formatIlsAgorot(item.clientLineTotalAgorot)}
              </dd>
            </div>
          ) : null}
        </dl>

        {workflow ? (
          <ClientProjectItemWorkflow
            projectId={projectId}
            projectItemId={item.projectItemId}
            workflow={workflow}
          />
        ) : null}
      </div>
    </article>
  );
}
