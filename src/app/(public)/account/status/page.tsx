import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { requireUser } from "@/lib/auth/authorization";
import { resolvePostAuthDestination, isArchitectApplicant } from "@/lib/auth/account-access";
import { logoutAction } from "@/lib/auth/logout-action";
import {
  isUserAccountApproved,
  isUserAccountPending,
  isUserAccountRejected,
} from "@/lib/users/account-status";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "סטטוס חשבון | Paper & Stone",
};

type AccountStatusPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountStatusPage({
  searchParams,
}: AccountStatusPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const justRegistered = resolvedSearchParams.registered === "1";

  if (isUserAccountApproved(user)) {
    redirect(
      resolvePostAuthDestination({
        role: user.role,
        accountStatus: user.accountStatus,
      }),
    );
  }

  const architectApplicant = isArchitectApplicant(user);
  const pending = isUserAccountPending(user);
  const rejected = isUserAccountRejected(user);

  return (
    <AuthPageLayout
      title="סטטוס חשבון"
      description={
        pending
          ? "החשבון שלכם ממתין לאישור מנהל המערכת."
          : "לא ניתן להיכנס לאזור העבודה עם החשבון הנוכחי."
      }
    >
      <div className={styles.panel}>
        {justRegistered ? (
          <p className={styles.lead} role="status">
            ההרשמה הושלמה בהצלחה.
          </p>
        ) : null}

        {pending && architectApplicant ? (
          <>
            <p className={styles.message}>
              בקשתכם להרשאת אדריכל נשלחה וממתינה לבדיקה. לאחר אישור תוכלו
              להיכנס לאזור האדריכל.
            </p>
            <p className={styles.note}>
              עד לאישור, אין גישה לאזור הלקוח או לאזור האדריכל.
            </p>
          </>
        ) : null}

        {pending && !architectApplicant ? (
          <>
            <p className={styles.message}>
              ההרשמה שלכם כלקוח ממתינה לאישור מנהל המערכת. נעדכן אתכם כאשר
              החשבון יאושר.
            </p>
            <p className={styles.note}>
              עד לאישור, אין גישה לאזור הלקוח.
            </p>
          </>
        ) : null}

        {rejected ? (
          <>
            <p className={styles.message}>החשבון שלכם נדחה.</p>
            <p className={styles.note}>
              לשאלות נוספות, פנו למנהל המערכת.
            </p>
          </>
        ) : null}

        <form action={logoutAction} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            התנתקות
          </button>
        </form>
      </div>
    </AuthPageLayout>
  );
}
