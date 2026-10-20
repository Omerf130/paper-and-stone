import styles from "./SiteUnavailable.module.scss";

export default function SiteUnavailable() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>Paper & Stone</p>
        <h1 className={styles.heading}>האתר אינו פעיל כרגע</h1>
        <p className={styles.body}>אתר Paper & Stone אינו זמין בשלב זה.</p>
        <p className={styles.thanks}>תודה על ההבנה.</p>
      </div>
    </div>
  );
}
