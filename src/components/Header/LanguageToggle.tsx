import styles from "./LanguageToggle.module.scss";

export default function LanguageToggle() {
  return (
    <div className={styles.toggle} aria-label="בחירת שפה">
      <span className={styles.inactive} aria-hidden="true">
        EN
      </span>
      <span className={styles.separator} aria-hidden="true">
        /
      </span>
      <span className={styles.active} aria-current="true">
        HE
      </span>
    </div>
  );
}
