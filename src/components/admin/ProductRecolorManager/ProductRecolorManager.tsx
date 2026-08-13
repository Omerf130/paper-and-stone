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
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { uploadRecolorMaskFile } from "@/lib/media/upload-recolor-mask-client";
import {
  mapRecolorStatusPresentation,
  mapRecolorStatusToFeedbackTone,
} from "@/lib/media/map-recolor-status-presentation";
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
  hideTitle?: boolean;
};

export default function ProductRecolorManager({
  media,
  previewColors,
  hideTitle = false,
}: ProductRecolorManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteMask, setConfirmDeleteMask] = useState(false);
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

    if (!primaryImage) {
      setError("יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה אוטומטית.");
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

    if (!primaryImage) {
      setError("יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה אוטומטית.");
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
          toast({ type: "error", message: result.error });
          return;
        }

        toast({ type: "success", message: "מסכת הצביעה נשמרה בהצלחה." });
        router.refresh();
      } catch {
        const message = "אירעה שגיאה בהעלאת המסכה.";
        setError(message);
        toast({ type: "error", message });
      }
    });
  };

  const handleEditorSave = async (file: File) => {
    if (!primaryImage) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await uploadRecolorMaskFile(
          media.productId,
          file,
          primaryImage.url,
        );

        if (result.error) {
          setError(result.error);
          toast({ type: "error", message: result.error });
          return;
        }

        toast({ type: "success", message: "מסכת הצביעה נשמרה בהצלחה." });
        setEditorOpen(false);
        router.refresh();
      } catch {
        const message = "אירעה שגיאה בשמירת המסכה.";
        setError(message);
        toast({ type: "error", message });
      }
    });
  };

  const handleDeleteMask = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteRecolorMaskAction(media.productId);
      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "מסכת הצביעה הוסרה." });
      setConfirmDeleteMask(false);
      router.refresh();
    });
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setError(null);

    startTransition(async () => {
      const result = await setRecolorEnabledAction(media.productId, enabled);
      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      toast({
        type: "success",
        message: enabled ? "צביעה אוטומטית הופעלה." : "צביעה אוטומטית הושבתה.",
      });
      router.refresh();
    });
  };

  const statusPresentation = mapRecolorStatusPresentation(recolorConfig.status);

  const canPreview =
    primaryImage &&
    recolorMask &&
    previewColor &&
    recolorConfig.status === "ready";

  const allowLoadExistingMask =
    recolorConfig.status === "ready" && Boolean(recolorMask?.url);

  const controlsDisabled = isPending || editorOpen;

  return (
    <div className={styles.section}>
      {hideTitle ? null : (
        <>
          <h2 className={styles.title}>צביעה אוטומטית</h2>
          <p className={styles.description}>
            צרו מסכה ישירות באתר או העלו קובץ PNG קיים. המסכה קובעת איזה אזור
            בתמונה הראשית ישנה צבע כאשר הלקוח בוחר צבע.
          </p>
        </>
      )}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!primaryImage ? (
        <p className={styles.notice}>
          יש להעלות תמונה ראשית לפני שניתן להגדיר צביעה אוטומטית.
        </p>
      ) : (
        <>
          <FeedbackBanner
            tone={mapRecolorStatusToFeedbackTone(recolorConfig.status)}
          >
            {statusPresentation.message}
          </FeedbackBanner>

          <ol className={styles.workflowSteps}>
            <li className={primaryImage ? styles.stepDone : ""}>
              תמונה ראשית
            </li>
            <li className={recolorMask ? styles.stepDone : ""}>מסכת צביעה</li>
            <li className={recolorConfig.enabled ? styles.stepDone : ""}>
              הפעלה בדף המוצר
            </li>
          </ol>

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

          <div className={styles.actions}>
            <Button
              disabled={controlsDisabled}
              onClick={() => void openEditor()}
            >
              {recolorMask ? "עריכת מסכה" : "יצירת מסכה"}
            </Button>

            <Button
              variant="secondary"
              disabled={controlsDisabled}
              onClick={() => setShowManualUpload((value) => !value)}
            >
              {showManualUpload ? "הסתרת העלאה ידנית" : "העלאת מסכה קיימת"}
            </Button>

            {recolorMask ? (
              <Button
                variant="danger"
                disabled={controlsDisabled}
                onClick={() => setConfirmDeleteMask(true)}
              >
                מחיקת מסכה
              </Button>
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
                  ? statusPresentation.message
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
              הפעלת צביעה אוטומטית בדף המוצר
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

      <ConfirmDialog
        open={confirmDeleteMask}
        title="מחיקת מסכת צביעה"
        description="למחוק את מסכת הצביעה? פעולה זו תשבית את הצביעה האוטומטית."
        confirmLabel="מחיקת מסכה"
        tone="danger"
        loading={isPending}
        onConfirm={handleDeleteMask}
        onCancel={() => setConfirmDeleteMask(false)}
      />
    </div>
  );
}
