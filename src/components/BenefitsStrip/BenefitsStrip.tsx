import styles from "./BenefitsStrip.module.scss";

const BENEFITS = [
  {
    title: "מקורות גלובליים",
    description: "מותגים נבחרים מרחבי העולם",
  },
  {
    title: "בקרת איכות",
    description: "סטנדרטים גבוהים בכל שלב",
  },
  {
    title: "ליווי מקצועי",
    description: "צוות ייעודי לפרויקטים",
  },
  {
    title: "משלוחים",
    description: "לוגיסטיקה אמינה ומדויקת",
  },
] as const;

export default function BenefitsStrip() {
  return (
    <section className={styles.strip} aria-label="יתרונות">
      <div className={styles.inner}>
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className={styles.item}>
            <p className={styles.title}>{benefit.title}</p>
            <p className={styles.description}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
