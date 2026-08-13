import styles from "./CatalogHero.module.scss";

export default function CatalogHero() {
  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Paper &amp; Stone</p>
      <h1 className={styles.title}>מוצרים</h1>
      <p className={styles.description}>
        מבחר מוצרים פעילים מ-Paper &amp; Stone.
      </p>
    </header>
  );
}
