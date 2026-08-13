import styles from "./ProductMetaList.module.scss";

export type ProductMetaItem = {
  term: string;
  value: string;
};

type ProductMetaListProps = {
  items: ProductMetaItem[];
};

export default function ProductMetaList({ items }: ProductMetaListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <dl className={styles.list}>
      {items.map((item) => (
        <div key={item.term} className={styles.row}>
          <dt>{item.term}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
