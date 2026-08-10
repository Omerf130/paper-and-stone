import Section from "@/components/Section/Section";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import { projects } from "../homepage-data";
import styles from "./InspirationSection.module.scss";

export default function InspirationSection() {
  return (
    <Section>
      <div className={styles.header}>
        <h2 className={styles.heading}>פרויקטים והשראה</h2>
      </div>

      <ul className={styles.grid}>
        {projects.map((project) => (
          <li
            key={project.id}
            className={
              project.layout === "featured"
                ? styles.itemFeatured
                : styles.itemStandard
            }
          >
            <VisualPlaceholder
              aspectRatio={project.layout === "featured" ? "wide" : "landscape"}
              className={styles.placeholder}
            />
            <div className={styles.meta}>
              <span className={styles.title}>{project.title}</span>
              <span className={styles.subtitle}>{project.subtitle}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
