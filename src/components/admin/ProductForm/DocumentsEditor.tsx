"use client";

import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import type { ProductDocumentInput } from "@/types/product-document";
import styles from "./DocumentsEditor.module.scss";

type DocumentsEditorProps = {
  documents: ProductDocumentInput[];
  onChange: (documents: ProductDocumentInput[]) => void;
  fieldErrors?: Record<string, string>;
};

function createEmptyDocument(): ProductDocumentInput {
  return { label: "", url: "", fileType: "" };
}

export default function DocumentsEditor({
  documents,
  onChange,
  fieldErrors = {},
}: DocumentsEditorProps) {
  const updateDocument = (
    index: number,
    key: keyof ProductDocumentInput,
    value: string,
  ) => {
    onChange(
      documents.map((document, documentIndex) =>
        documentIndex === index ? { ...document, [key]: value } : document,
      ),
    );
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, documentIndex) => documentIndex !== index));
  };

  const addDocument = () => {
    onChange([...documents, createEmptyDocument()]);
  };

  return (
    <div className={styles.editor}>
      <p className={styles.hint}>
        מסמכים ציבוריים להורדה מהדף הציבורי של המוצר. שרטוט טכני במדיה נשאר
        נפרד.
      </p>

      {documents.length === 0 ? (
        <p className={styles.empty}>אין מסמכים להורדה.</p>
      ) : (
        <ul className={styles.list}>
          {documents.map((document, index) => (
            <li key={index} className={styles.item}>
              <div className={styles.fields}>
                <FormField
                  label="שם המסמך"
                  htmlFor={`document-label-${index}`}
                  error={fieldErrors[`documents.${index}.label`]}
                >
                  <input
                    id={`document-label-${index}`}
                    className={formFieldStyles.input}
                    value={document.label}
                    onChange={(event) =>
                      updateDocument(index, "label", event.target.value)
                    }
                  />
                </FormField>
                <FormField
                  label="כתובת URL"
                  htmlFor={`document-url-${index}`}
                  error={fieldErrors[`documents.${index}.url`]}
                >
                  <input
                    id={`document-url-${index}`}
                    className={formFieldStyles.input}
                    dir="ltr"
                    value={document.url}
                    onChange={(event) =>
                      updateDocument(index, "url", event.target.value)
                    }
                  />
                </FormField>
                <FormField
                  label="סוג קובץ (אופציונלי)"
                  htmlFor={`document-fileType-${index}`}
                  error={fieldErrors[`documents.${index}.fileType`]}
                >
                  <input
                    id={`document-fileType-${index}`}
                    className={formFieldStyles.input}
                    placeholder="pdf"
                    dir="ltr"
                    value={document.fileType ?? ""}
                    onChange={(event) =>
                      updateDocument(index, "fileType", event.target.value)
                    }
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
              >
                הסרה
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="secondary" size="sm" onClick={addDocument}>
        הוספת מסמך
      </Button>
    </div>
  );
}
