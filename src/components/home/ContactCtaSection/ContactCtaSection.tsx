import Button from "@/components/Button/Button";
import Section from "@/components/Section/Section";
import styles from "./ContactCtaSection.module.scss";

export default function ContactCtaSection() {
  return (
    <Section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.heading}>מתחילים פרויקט?</h2>
        <p className={styles.supporting}>
          נשמח להכיר את הפרויקט, להבין את הצרכים ולבנות יחד את
          הבחירה הנכונה.
        </p>
        <div aria-label="תצוגה מקדימה — כפתור לא פעיל">
          <Button preview variant="primary">
            דברו איתנו
          </Button>
        </div>
      </div>
    </Section>
  );
}
