import Section from "@/components/Section/Section";
import VisualPlaceholder from "@/components/VisualPlaceholder/VisualPlaceholder";
import { categories } from "../homepage-data";
import styles from "./CategoriesSection.module.scss";

export default function CategoriesSection() {
  return (
    <Section>
      <div className={styles.header}>
        <h2 className={styles.heading}>קטגוריות</h2>
        <p className={styles.supporting}>
          ריהוט, חומרים וגמרים — מאורגנים לפי סוג ושימוש בפרויקט
        </p>
      </div>

      <ul className={styles.grid}>
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
    </Section>
  );
}
