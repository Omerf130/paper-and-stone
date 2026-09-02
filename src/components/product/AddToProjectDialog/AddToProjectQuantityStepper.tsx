import styles from "./AddToProjectQuantityStepper.module.scss";

type AddToProjectQuantityStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export default function AddToProjectQuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 999,
  disabled = false,
}: AddToProjectQuantityStepperProps) {
  return (
    <div className={styles.field}>
      <p className={styles.label}>כמות</p>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.button}
          aria-label="הפחתת כמות"
          onClick={onDecrease}
          disabled={disabled || quantity <= min}
        >
          −
        </button>
        <span className={styles.value} aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className={styles.button}
          aria-label="הוספת כמות"
          onClick={onIncrease}
          disabled={disabled || quantity >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
