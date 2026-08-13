import styles from "./ProductOptionGroup.module.scss";

export type ProductOption = {
  id: string;
  label: string;
};

type ProductOptionGroupProps = {
  legend: string;
  options: ProductOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  groupLabel?: string;
};

export default function ProductOptionGroup({
  legend,
  options,
  selectedId,
  onSelect,
  groupLabel,
}: ProductOptionGroupProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div
        className={styles.optionGroup}
        role="group"
        aria-label={groupLabel ?? legend}
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={
              selectedId === option.id ? styles.optionActive : styles.optionButton
            }
            aria-pressed={selectedId === option.id}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
