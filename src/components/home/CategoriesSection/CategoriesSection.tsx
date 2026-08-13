import Container from "@/components/Container/Container";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import { categories } from "../homepage-data";
import styles from "./CategoriesSection.module.scss";

export default function CategoriesSection() {
  return (
    <section className={styles.section} aria-labelledby="home-categories-heading">
      <Container variant="wide">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>קטגוריות</p>
          <h2 id="home-categories-heading" className={styles.heading}>
            ריהוט, חומרים וגמרים
          </h2>
          <p className={styles.supporting}>
            מאורגנים לפי סוג ושימוש בפרויקט — תצוגה עריכתית לקראת הרחבת הקטלוג.
          </p>
        </div>

        <ul className={styles.grid} aria-label="קטגוריות מוצרים">
          {categories.map((category) => (
            <li
              key={category.id}
              className={
                category.layout === "large" ? styles.tileLarge : styles.tileMedium
              }
            >
              <VisualPlaceholder
                aspectRatio={category.layout === "large" ? "wide" : "landscape"}
                className={styles.placeholder}
              />
              <span className={styles.label}>{category.name}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
