import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import { projects } from "../homepage-data";
import styles from "./InspirationSection.module.scss";

export default function InspirationSection() {
  return (
    <section className={styles.section} aria-labelledby="home-inspiration-heading">
      <Container variant="wide">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>פרויקטים והשראה</p>
          <h2 id="home-inspiration-heading" className={styles.heading}>
            מבט לפרויקטים
          </h2>
          <p className={styles.note}>
            תוכן המחצה — יש להחליף לפני השקה.
          </p>
        </div>

        <ul className={styles.grid} aria-label="פרויקטים להשראה">
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
      </Container>
    </section>
  );
}
