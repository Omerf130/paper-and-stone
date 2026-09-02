"use client";

import { formatDateTime } from "@/lib/ui/format-date-time";
import type { AdminProjectPaymentView } from "@/types/project-payment";
import tableStyles from "@/components/admin/project-detail/admin-project-detail-table.module.scss";
import styles from "./AdminProjectPaymentHistory.module.scss";

type AdminProjectPaymentHistoryProps = {
  payments: AdminProjectPaymentView[];
  onEdit: (payment: AdminProjectPaymentView) => void;
  onDelete: (payment: AdminProjectPaymentView) => void;
};

export default function AdminProjectPaymentHistory({
  payments,
  onEdit,
  onDelete,
}: AdminProjectPaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <section className={styles.history} aria-labelledby="payments-history-title">
        <h2 id="payments-history-title" className={styles.title}>
          היסטוריית תשלומים
        </h2>
        <p className={styles.empty}>עדיין לא נרשמו תשלומים.</p>
      </section>
    );
  }

  return (
    <section className={styles.history} aria-labelledby="payments-history-title">
      <h2 id="payments-history-title" className={styles.title}>
        היסטוריית תשלומים
      </h2>

      <div className={tableStyles.tableWrap}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th scope="col">תאריך</th>
              <th scope="col">סכום</th>
              <th scope="col">אמצעי</th>
              <th scope="col">הערה</th>
              <th scope="col">נרשם על ידי</th>
              <th scope="col">
                <span className={tableStyles.srOnly}>פעולות</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{formatDateTime(payment.paymentDate)}</td>
                <td>{payment.amountFormatted}</td>
                <td>{payment.paymentMethodLabel}</td>
                <td className={tableStyles.noteCell}>{payment.note ?? "—"}</td>
                <td>{payment.createdByAdminLabel ?? "—"}</td>
                <td className={tableStyles.actionsCell}>
                  <details className={styles.menu}>
                    <summary className={styles.menuTrigger} aria-label="פעולות תשלום">
                      ⋯
                    </summary>
                    <div className={styles.menuPanel}>
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => onEdit(payment)}
                      >
                        עריכה
                      </button>
                      <button
                        type="button"
                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        onClick={() => onDelete(payment)}
                      >
                        מחיקה
                      </button>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={styles.cards}>
        {payments.map((payment) => (
          <li key={payment.id}>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.cardAmount}>{payment.amountFormatted}</p>
                <p className={styles.cardDate}>
                  {formatDateTime(payment.paymentDate)}
                </p>
              </div>
              <p className={styles.cardMeta}>
                {payment.paymentMethodLabel}
                {payment.createdByAdminLabel
                  ? ` · ${payment.createdByAdminLabel}`
                  : ""}
              </p>
              {payment.note ? (
                <p className={styles.cardNote}>{payment.note}</p>
              ) : null}
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => onEdit(payment)}
                >
                  עריכה
                </button>
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={() => onDelete(payment)}
                >
                  מחיקה
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
