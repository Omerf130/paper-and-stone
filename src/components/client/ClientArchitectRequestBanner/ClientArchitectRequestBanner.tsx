import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import styles from "./ClientArchitectRequestBanner.module.scss";

export default function ClientArchitectRequestBanner() {
  return (
    <FeedbackBanner tone="info" className={styles.banner}>
      בקשתך להרשאת אדריכל ממתינה לטיפול.
    </FeedbackBanner>
  );
}
