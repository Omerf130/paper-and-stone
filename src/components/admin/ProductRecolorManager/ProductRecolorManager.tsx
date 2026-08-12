"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";
import {
  deleteRecolorMaskAction,
  setRecolorEnabledAction,
} from "@/app/admin/products/media-actions";
import ProductMaskEditor from "@/components/admin/ProductMaskEditor/ProductMaskEditor";
import ProductRecolorCanvas from "@/components/product/ProductRecolorCanvas/ProductRecolorCanvas";
import { uploadRecolorMaskFile } from "@/lib/media/upload-recolor-mask-client";
import { loadImageDimensionsFromUrl } from "@/lib/recolor/load-image-dimensions";
import type { AdminProductMediaView } from "@/types/admin-product-media";
import styles from "./ProductRecolorManager.module.scss";

type PreviewColor = {
  id: string;
  name: string;
  hex: string;
};

type ProductRecolorManagerProps = {
  media: AdminProductMediaView;
  previewColors: PreviewColor[];
};

export default function ProductRecolorManager({
  media,
  previewColors,
}: ProductRecolorManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewColorId, setPreviewColorId] = useState<string>(
    previewColors[0]?.id ?? "",
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [primaryDimensions, setPrimaryDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const maskInputId = useId();

  const previewColor = useMemo(
    () =>
      previewColors.find((color) => color.id === previewColorId) ??
      previewColors[0],
    [previewColorId, previewColors],
  );

  const { primaryImage, recolorMask, recolorConfig } = media;

  const openEditor = async () => {
    setError(null);
    setSuccess(null);

    if (!primaryImage) {
      setError("יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה דינמית.");
      return;
    }

    try {
      const dimensions = await loadImageDimensionsFromUrl(primaryImage.url);
      setPrimaryDimensions(dimensions);
      setEditorOpen(true);
    } catch {
      setError("לא ניתן לטעון את מידות התמונה הראשית.");
    }
  };

  const handleMaskUpload = async (file: File) => {
    setError(null);
    setSuccess(null);

    if (!primaryImage) {
      setError("יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה דינמית.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await uploadRecolorMaskFile(
          media.productId,
          file,
          primaryImage.url,
        );

        if (result.error) {
          setError(result.error);
          return;
        }

        setSuccess("מסכת הצביעה נשמרה בהצלחה.");
        router.refresh();
      } catch {
        setError("אירעה שגיאה בהעלאת המסכה.");
      }
    });
  };

  const handleEditorSave = async (file: File) => {
    if (!primaryImage) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await uploadRecolorMaskFile(
          media.productId,
          file,
          primaryImage.url,
        );

        if (result.error) {
          setError(result.error);
          return;
        }

        setSuccess("מסכת הצביעה נשמרה בהצלחה.");
        setEditorOpen(false);
        router.refresh();
      } catch {
        setError("אירעה שגיאה בשמירת המסכה.");
      }
    });
  };

  const handleDeleteMask = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await deleteRecolorMaskAction(media.productId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess("מסכת הצביעה הוסרה.");
      router.refresh();
    });
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await setRecolorEnabledAction(media.productId, enabled);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(enabled ? "צביעה דינמית הופעלה." : "צביעה דינמית הושבתה.");
      router.refresh();
    });
  };

  const statusMessages: Record<string, string> = {
    missing_primary: "יש להעלות תמונה ראשית.",
    missing_mask: "יש ליצור או להעלות מסכת צביעה.",
    invalid_source:
      "התמונה הראשית השתנתה — יש ליצור מסכה חדשה התואמת לתמונה הנוכחית.",
    ready: "הגדרות הצביעה מוכנות.",
  };

  const canPreview =
    primaryImage &&
    recolorMask &&
    previewColor &&
    recolorConfig.status === "ready";

  const allowLoadExistingMask =
    recolorConfig.status === "ready" && Boolean(recolorMask?.url);

  const controlsDisabled = isPending || editorOpen;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>צביעה דינמית</h2>
      <p className={styles.description}>
        צרו מסכה ישירות באתר או העלו קובץ PNG קיים. המסכה קובעת איזה אזור
        בתמונה הראשית ישנה צבע כאשר הלקוח בוחר צבע.
      </p>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className={styles.success} role="status">
          {success}
        </p>
      ) : null}

      {!primaryImage ? (
        <p className={styles.notice}>
          יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה דינמית.
        </p>
      ) : (
        <>
          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>תמונה ראשית</p>
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || media.productNameHe}
                width={480}
                height={360}
                className={styles.previewImage}
              />
            </div>

            {recolorMask ? (
              <div className={styles.previewCard}>
                <p className={styles.previewLabel}>מסכת צביעה</p>
                <Image
                  src={recolorMask.url}
                  alt="מסכת צביעה"
                  width={480}
                  height={360}
                  className={styles.previewImage}
                />
              </div>
            ) : null}
          </div>

          <p className={styles.status}>
            סטטוס: {statusMessages[recolorConfig.status] ?? recolorConfig.status}
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={controlsDisabled}
              onClick={() => void openEditor()}
            >
              {recolorMask ? "עריכת מסכה" : "יצירת מסכה"}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              disabled={controlsDisabled}
              onClick={() => setShowManualUpload((value) => !value)}
            >
              {showManualUpload ? "הסתרת העלאה ידנית" : "העלאת מסכה קיימת"}
            </button>

            {recolorMask ? (
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={controlsDisabled}
                onClick={handleDeleteMask}
              >
                מחיקת מסכה
              </button>
            ) : null}
          </div>

          {showManualUpload ? (
            <div className={styles.manualUpload}>
              <div className={styles.uploadField}>
                <label className={styles.uploadLabel} htmlFor={maskInputId}>
                  {recolorMask ? "החלפת מסכת צביעה" : "העלאת מסכת צביעה"}
                </label>
                <input
                  id={maskInputId}
                  type="file"
                  accept="image/png"
                  disabled={controlsDisabled}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleMaskUpload(file);
                    }
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          ) : null}

          {editorOpen && primaryDimensions ? (
            <ProductMaskEditor
              sourceImageUrl={primaryImage.url}
              sourceAlt={primaryImage.altText || media.productNameHe}
              naturalWidth={primaryDimensions.width}
              naturalHeight={primaryDimensions.height}
              initialMaskUrl={recolorMask?.url}
              allowLoadExistingMask={allowLoadExistingMask}
              invalidSourceWarning={
                recolorConfig.status === "invalid_source"
                  ? statusMessages.invalid_source
                  : null
              }
              previewColors={previewColors}
              onSave={handleEditorSave}
              onCancel={() => setEditorOpen(false)}
              isSaving={isPending}
            />
          ) : null}

          {recolorMask ? (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={recolorConfig.enabled}
                disabled={controlsDisabled || recolorConfig.status !== "ready"}
                onChange={(event) => handleToggleEnabled(event.target.checked)}
              />
              הפעלת צביעה דינמית בדף המוצר
            </label>
          ) : null}

          {canPreview ? (
            <div className={styles.previewSection}>
              <div className={styles.previewControls}>
                <label className={styles.uploadLabel} htmlFor="preview-color">
                  צבע לתצוגה מקדימה
                </label>
                <select
                  id="preview-color"
                  className={styles.select}
                  value={previewColor?.id ?? ""}
                  onChange={(event) => setPreviewColorId(event.target.value)}
                >
                  {previewColors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name} ({color.hex})
                    </option>
                  ))}
                </select>
              </div>

              <ProductRecolorCanvas
                sourceImage={{
                  url: primaryImage.url,
                  alt: primaryImage.altText || media.productNameHe,
                }}
                mask={{ url: recolorMask.url }}
                hex={previewColor.hex}
                fallback={
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.altText || media.productNameHe}
                    width={480}
                    height={360}
                    className={styles.previewImage}
                  />
                }
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
