import Link from "next/link";
import styles from "./AdminDashboardAttention.module.scss";

type AttentionEntry = {
  key: string;
  primary: string;
  secondary: string;
  href?: string;
  tone: "attention" | "message" | "review" | "request" | "quote" | "active" | "neutral";
  isEmpty?: boolean;
};

type AdminDashboardAttentionProps = {
  attentionProjectCount: number;
  activeProjectCount: number;
  submittedProjectCount: number;
  pendingOnboardingProjectCount: number;
  unreadAdminMessageCount: number;
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingArchitectCount: number;
  pendingArchitectRequestCount: number;
  pendingClientRequestCount: number;
};

function buildEntries(props: AdminDashboardAttentionProps): AttentionEntry[] {
  const entries: AttentionEntry[] = [];

  if (props.attentionProjectCount > 0) {
    entries.push({
      key: "attention",
      primary: `${props.attentionProjectCount} פרויקטים דורשים טיפול`,
      secondary: "פרויקטים · דורש טיפול",
      href: "/admin/projects?queue=attention",
      tone: "attention",
    });
  }

  if (props.unreadAdminMessageCount > 0) {
    entries.push({
      key: "messages",
      primary: `${props.unreadAdminMessageCount} הודעות חדשות בפרויקטים`,
      secondary: "הודעות · לאחרונה",
      href: "/admin/projects?queue=attention",
      tone: "message",
    });
  }

  if (props.submittedProjectCount > 0) {
    entries.push({
      key: "submitted",
      primary: `${props.submittedProjectCount} פרויקטים ממתינים לבדיקה מסחרית`,
      secondary: "פרויקטים · בדיקה מסחרית",
      href: "/admin/projects?queue=commercial",
      tone: "review",
    });
  }

  if (props.pendingOnboardingProjectCount > 0) {
    entries.push({
      key: "onboarding",
      primary: `${props.pendingOnboardingProjectCount} פרויקטים ממתינים לאישור פתיחה`,
      secondary: "פרויקטים · אישור פתיחה",
      href: "/admin/projects?queue=onboarding",
      tone: "review",
    });
  }

  if (props.pendingClientRequestCount > 0) {
    entries.push({
      key: "client-requests",
      primary: `${props.pendingClientRequestCount} בקשות לקוח ממתינות`,
      secondary: "CRM · בקשות לקוח",
      href: "/admin/client-requests",
      tone: "request",
    });
  }

  if (props.pendingArchitectRequestCount > 0) {
    entries.push({
      key: "architect-requests",
      primary: `${props.pendingArchitectRequestCount} בקשות אדריכל ממתינות`,
      secondary: "CRM · בקשות אדריכל",
      href: "/admin/architect-requests",
      tone: "request",
    });
  }

  if (props.quoteChangeRequestedCount > 0) {
    entries.push({
      key: "quote-changes",
      primary: `${props.quoteChangeRequestedCount} בקשות שינוי תמחור`,
      secondary: "תמחור · בקשות שינוי",
      href: "/admin/projects?queue=commercial",
      tone: "quote",
    });
  }

  if (props.quoteAwaitingArchitectCount > 0) {
    entries.push({
      key: "quote-architect",
      primary: `${props.quoteAwaitingArchitectCount} הצעות מחיר ממתינות לתגובת אדריכל`,
      secondary: "תמחור · ממתין לאדריכל",
      href: "/admin/projects?queue=commercial",
      tone: "quote",
    });
  }

  if (props.quoteAcceptedAwaitingApprovalCount > 0) {
    entries.push({
      key: "quote-approval",
      primary: `${props.quoteAcceptedAwaitingApprovalCount} הצעות מחיר ממתינות לאישור סופי`,
      secondary: "תמחור · אישור סופי",
      href: "/admin/projects?queue=commercial",
      tone: "quote",
    });
  }

  if (props.activeProjectCount > 0) {
    entries.push({
      key: "active",
      primary: `${props.activeProjectCount} פרויקטים פעילים בעבודה`,
      secondary: "פרויקטים · פעילים",
      href: "/admin/projects?queue=active",
      tone: "active",
    });
  }

  if (entries.length === 0) {
    entries.push({
      key: "empty",
      primary: "אין פעילות שדורשת טיפול כרגע",
      secondary: "הכל מעודכן",
      tone: "neutral",
      isEmpty: true,
    });
  }

  return entries.slice(0, 8);
}

export default function AdminDashboardAttention(props: AdminDashboardAttentionProps) {
  const entries = buildEntries(props);

  return (
    <section className={styles.section} aria-labelledby="dashboard-attention-title">
      <div className={styles.header}>
        <h2 id="dashboard-attention-title" className={styles.title}>
          פעילות אחרונה
        </h2>
      </div>

      <ul className={styles.feed}>
        {entries.map((entry) => (
          <li key={entry.key} className={styles.item}>
            <span
              className={`${styles.marker} ${styles[`marker_${entry.tone}`]}`}
              aria-hidden="true"
            />
            <div className={styles.content}>
              {entry.href && !entry.isEmpty ? (
                <Link href={entry.href} className={styles.primary}>
                  {entry.primary}
                </Link>
              ) : (
                <span className={entry.isEmpty ? styles.primaryMuted : styles.primary}>
                  {entry.primary}
                </span>
              )}
              <span className={styles.secondary}>{entry.secondary}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
