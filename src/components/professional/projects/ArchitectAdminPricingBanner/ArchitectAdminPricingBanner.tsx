import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import styles from "./ArchitectAdminPricingBanner.module.scss";

export default function ArchitectAdminPricingBanner() {
  return (
    <div className={styles.banner}>
      <FeedbackBanner tone="info">
        <p>המנהל עדכן את התמחור. ניתן לעיין במחירים ולהמשיך בעבודה.</p>
      </FeedbackBanner>
    </div>
  );
}
