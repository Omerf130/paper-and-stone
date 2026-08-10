import Button from "@/components/Button/Button";
import Section from "@/components/Section/Section";
import { workflowSteps } from "../homepage-data";
import styles from "./ProfessionalsSection.module.scss";

export default function ProfessionalsSection() {
  return (
    <Section className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>כל הפרויקט. במקום אחד.</h2>
        <p className={styles.supporting}>
          פלטפורמה מקצועית לניהול פרויקטים — מארגון חדרים ומוצרים
          ועד שליחה לתמחור ומעקב.
        </p>
      </div>

      <ol className={styles.steps}>
        {workflowSteps.map((step) => (
          <li key={step.step} className={styles.step}>
            <span className={styles.stepNumber}>{step.step}</span>
            <span className={styles.stepTitle}>{step.title}</span>
          </li>
        ))}
      </ol>

      <div aria-label="תצוגה מקדימה — כפתור לא פעיל">
        <Button preview variant="secondary">
          לאזור המקצועי
        </Button>
      </div>
    </Section>
  );
}
