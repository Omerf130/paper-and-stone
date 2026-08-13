"use client";

import styles from "./form-section.module.scss";

type MaterialsEditorProps = {
  materials: string[];
  onChange: (materials: string[]) => void;
};

export default function MaterialsEditor({
  materials,
  onChange,
}: MaterialsEditorProps) {
  const addMaterial = () => {
    onChange([...materials, ""]);
  };

  const updateMaterial = (index: number, value: string) => {
    onChange(
      materials.map((material, materialIndex) =>
        materialIndex === index ? value : material,
      ),
    );
  };

  const removeMaterial = (index: number) => {
    onChange(materials.filter((_, materialIndex) => materialIndex !== index));
  };

  return (
    <div className={styles.stack}>
      <p className={styles.subheading}>חומרים (טקסט לתצוגה במפרט)</p>
      {materials.map((material, index) => (
        <div key={`material-${index}`} className={styles.inlineRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`material-${index}`}>
              חומר
            </label>
            <input
              id={`material-${index}`}
              className={styles.input}
              value={material}
              onChange={(event) => updateMaterial(index, event.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeMaterial(index)}
          >
            הסרה
          </button>
        </div>
      ))}

      <button type="button" className={styles.addButton} onClick={addMaterial}>
        הוספת חומר
      </button>
    </div>
  );
}
