"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import {
  deleteGalleryImageAction,
  deletePrimaryImageAction,
  deleteTechnicalDrawingAction,
  finalizeMediaUploadAction,
  moveGalleryImageAction,
  prepareMediaUploadAction,
  previewProductImageNormalizationAction,
  updateGalleryAltTextAction,
  updatePrimaryAltTextAction,
  updateTechnicalAltTextAction,
} from "@/app/admin/products/media-actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { GALLERY_MAX_COUNT } from "@/lib/media/media-validation";
import { shouldNormalizeMediaSlot } from "@/lib/media/normalization-policy";
import type {
  AdminMediaItemView,
  AdminProductMediaView,
  MediaSlot,
} from "@/types/admin-product-media";
import { validateFileForSlotClient } from "@/lib/media/media-validation";
import styles from "./ProductMediaManager.module.scss";

type ProductMediaManagerProps = {
  media: AdminProductMediaView;
  hideTitle?: boolean;
};

type PendingKey =
  | "primary-upload"
  | "primary-delete"
  | "primary-alt"
  | "gallery-upload"
  | `gallery-delete-${string}`
  | `gallery-move-${string}`
  | `gallery-alt-${string}`
  | "technical-upload"
  | "technical-delete"
  | "technical-alt"
  | null;

type ConfirmAction =
  | { type: "primary-delete" }
  | { type: "gallery-delete"; id: string }
  | { type: "technical-delete" }
  | null;

type PendingNormalizedUpload = {
  slot: MediaSlot;
  altText?: string;
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
  normalized: boolean;
  skipped: boolean;
  reason: string;
};

function fileFromBase64(
  base64: string,
  filename: string,
  mimeType: string,
): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mimeType });
}

function previewMessage(normalized: boolean, skipped: boolean, reason: string) {
  if (normalized) {
    return "התמונה עברה התאמת מסגור אוטומטית. כך היא תוצג בקטלוג ובדף המוצר.";
  }

  if (skipped && reason === "well_framed") {
    return "התמונה כבר ממוסגרת היטב — נשמרת ללא שינוי.";
  }

  if (skipped && reason === "detection_uncertain") {
    return "לא ניתן לזהות את המוצר בביטחון — נשמרת התמונה המקורית.";
  }

  return "התמונה תישמר ללא שינוי.";
}

export default function ProductMediaManager({
  media,
  hideTitle = false,
}: ProductMediaManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<PendingKey>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingUpload, setPendingUpload] =
    useState<PendingNormalizedUpload | null>(null);

  const [primaryAlt, setPrimaryAlt] = useState(
    media.primaryImage?.altText ?? "",
  );
  const [technicalAlt, setTechnicalAlt] = useState(
    media.technicalDrawing?.altText ??
      `שרטוט טכני של ${media.productNameHe}`,
  );
  const [galleryAlts, setGalleryAlts] = useState<Record<string, string>>(() =>
    Object.fromEntries(media.gallery.map((item) => [item.id, item.altText])),
  );

  const primaryInputId = useId();
  const galleryInputId = useId();
  const technicalInputId = useId();

  const runAction = (
    key: PendingKey,
    action: () => Promise<{ error?: string; success?: boolean } | void>,
    successMessage?: string,
  ) => {
    setError(null);
    setPendingKey(key);

    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) {
          setError(result.error);
          toast({ type: "error", message: result.error });
        } else {
          toast({
            type: "success",
            message: successMessage ?? "הפעולה בוצעה בהצלחה.",
          });
          router.refresh();
        }
      } catch {
        const message = "אירעה שגיאה. נסו שוב.";
        setError(message);
        toast({ type: "error", message });
      } finally {
        setPendingKey(null);
      }
    });
  };

  const handleUpload = async (
    slot: MediaSlot,
    file: File,
    altText?: string,
    metadata?: {
      width?: number;
      height?: number;
      normalized?: boolean;
    },
  ) => {
    const clientValidation = validateFileForSlotClient(file, slot);
    if (!clientValidation.ok) {
      setError(clientValidation.message);
      return;
    }

    const pending: PendingKey =
      slot === "primary"
        ? "primary-upload"
        : slot === "gallery"
          ? "gallery-upload"
          : "technical-upload";

    setError(null);
    setPendingKey(pending);

    startTransition(async () => {
      try {
        const prepared = await prepareMediaUploadAction(
          media.productId,
          slot,
          file.name,
          altText,
        );

        if ("error" in prepared) {
          setError(prepared.error);
          toast({ type: "error", message: prepared.error });
          return;
        }

        const basePayload = JSON.parse(prepared.clientPayload) as Record<
          string,
          unknown
        >;
        const clientPayload = JSON.stringify({
          ...basePayload,
          width: metadata?.width,
          height: metadata?.height,
          normalized: metadata?.normalized,
          byteSize: file.size,
        });

        const blob = await upload(prepared.pathname, file, {
          access: "public",
          handleUploadUrl: `/api/admin/products/${media.productId}/media/upload`,
          clientPayload,
          contentType: file.type,
        });

        const finalize = await finalizeMediaUploadAction({
          productId: media.productId,
          slot,
          pathname: blob.pathname,
          url: blob.url,
          contentType: blob.contentType,
          originalFilename: file.name,
          byteSize: file.size,
          altText,
          width: metadata?.width,
          height: metadata?.height,
          normalized: metadata?.normalized,
        });

        if (finalize.error) {
          setError(finalize.error);
          toast({ type: "error", message: finalize.error });
          return;
        }

        toast({ type: "success", message: "הקובץ הועלה בהצלחה." });
        router.refresh();
      } catch {
        const message = "אירעה שגיאה בהעלאת הקובץ.";
        setError(message);
        toast({ type: "error", message });
      } finally {
        setPendingKey(null);
      }
    });
  };

  const beginUpload = async (
    slot: MediaSlot,
    file: File,
    altText?: string,
  ) => {
    const clientValidation = validateFileForSlotClient(file, slot);
    if (!clientValidation.ok) {
      setError(clientValidation.message);
      return;
    }

    if (!shouldNormalizeMediaSlot(slot)) {
      void handleUpload(slot, file, altText);
      return;
    }

    const pending: PendingKey =
      slot === "primary" ? "primary-upload" : "gallery-upload";
    setError(null);
    setPendingKey(pending);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("slot", slot);

        const preview = await previewProductImageNormalizationAction(formData);
        if ("error" in preview) {
          setError(preview.error);
          toast({ type: "error", message: preview.error });
          return;
        }

        const uploadFile = fileFromBase64(
          preview.previewBase64,
          preview.suggestedFilename,
          preview.mimeType,
        );
        const previewUrl = URL.createObjectURL(uploadFile);

        setPendingUpload({
          slot,
          altText,
          file: uploadFile,
          previewUrl,
          width: preview.width || undefined,
          height: preview.height || undefined,
          normalized: preview.normalized,
          skipped: preview.skipped,
          reason: preview.reason,
        });
      } catch {
        const message = "אירעה שגיאה בעיבוד התמונה.";
        setError(message);
        toast({ type: "error", message });
      } finally {
        setPendingKey(null);
      }
    });
  };

  const confirmPendingUpload = () => {
    if (!pendingUpload) {
      return;
    }

    const current = pendingUpload;
    setPendingUpload(null);
    URL.revokeObjectURL(current.previewUrl);

    void handleUpload(current.slot, current.file, current.altText, {
      width: current.width,
      height: current.height,
      normalized: current.normalized || undefined,
    });
  };

  const cancelPendingUpload = () => {
    if (pendingUpload) {
      URL.revokeObjectURL(pendingUpload.previewUrl);
    }
    setPendingUpload(null);
  };

  const onFileChange = (
    slot: MediaSlot,
    event: React.ChangeEvent<HTMLInputElement>,
    altText?: string,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    void beginUpload(slot, file, altText);
  };

  const galleryCount = media.gallery.length;
  const galleryFull = galleryCount >= GALLERY_MAX_COUNT;

  return (
    <div className={styles.section}>
      {hideTitle ? null : (
        <div>
          <h2 className={styles.sectionTitle}>מדיה</h2>
          <p className={styles.sectionDescription}>
            תמונה ראשית, גלריה ושרטוט טכני למוצר.
          </p>
        </div>
      )}

      {error ? (
        <p className={styles.messageError} role="alert">
          {error}
        </p>
      ) : null}

      <PrimarySection
        item={media.primaryImage}
        altText={primaryAlt}
        inputId={primaryInputId}
        isBusy={isPending}
        pendingKey={pendingKey}
        onAltChange={setPrimaryAlt}
        onFileChange={(event) => onFileChange("primary", event, primaryAlt)}
        onSaveAlt={() =>
          runAction("primary-alt", () =>
            updatePrimaryAltTextAction(media.productId, primaryAlt),
          )
        }
        onDelete={() => setConfirmAction({ type: "primary-delete" })}
      />

      <GallerySection
        items={media.gallery}
        galleryAlts={galleryAlts}
        inputId={galleryInputId}
        galleryFull={galleryFull}
        isBusy={isPending}
        pendingKey={pendingKey}
        onAltChange={(id, value) =>
          setGalleryAlts((current) => ({ ...current, [id]: value }))
        }
        onFileChange={(event) => onFileChange("gallery", event)}
        onSaveAlt={(id) =>
          runAction(`gallery-alt-${id}`, () =>
            updateGalleryAltTextAction(
              media.productId,
              id,
              galleryAlts[id] ?? "",
            ),
          )
        }
        onDelete={(id) => setConfirmAction({ type: "gallery-delete", id })}
        onMove={(id, direction) =>
          runAction(`gallery-move-${id}`, () =>
            moveGalleryImageAction(media.productId, id, direction),
          )
        }
      />

      <TechnicalSection
        item={media.technicalDrawing}
        altText={technicalAlt}
        inputId={technicalInputId}
        isBusy={isPending}
        pendingKey={pendingKey}
        onAltChange={setTechnicalAlt}
        onFileChange={(event) =>
          onFileChange("technical", event, technicalAlt)
        }
        onSaveAlt={() =>
          runAction("technical-alt", () =>
            updateTechnicalAltTextAction(media.productId, technicalAlt),
          )
        }
        onDelete={() => setConfirmAction({ type: "technical-delete" })}
      />

      {pendingUpload ? (
        <div className={styles.normalizationPreview} role="dialog" aria-modal="true">
          <h3 className={styles.subheading}>תצוגה מקדימה לפני שמירה</h3>
          <p className={styles.helperText}>
            {previewMessage(
              pendingUpload.normalized,
              pendingUpload.skipped,
              pendingUpload.reason,
            )}
          </p>
          <div className={styles.preview}>
            <Image
              src={pendingUpload.previewUrl}
              alt="תצוגה מקדימה של תמונת מוצר"
              fill
              sizes="320px"
              className={styles.previewImage}
              unoptimized
            />
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmPendingUpload}
              disabled={isPending}
              loading={
                pendingKey === "primary-upload" || pendingKey === "gallery-upload"
              }
              loadingLabel="שומר..."
            >
              שמירה
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={cancelPendingUpload}
              disabled={isPending}
            >
              ביטול
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmAction?.type === "primary-delete"}
        title="הסרת תמונה ראשית"
        description="להסיר את התמונה הראשית?"
        confirmLabel="הסרה"
        tone="danger"
        loading={pendingKey === "primary-delete"}
        onConfirm={() => {
          runAction("primary-delete", () =>
            deletePrimaryImageAction(media.productId),
          );
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === "gallery-delete"}
        title="הסרת תמונה מהגלריה"
        description="להסיר תמונה זו מהגלריה?"
        confirmLabel="הסרה"
        tone="danger"
        loading={
          confirmAction?.type === "gallery-delete" &&
          pendingKey === `gallery-delete-${confirmAction.id}`
        }
        onConfirm={() => {
          if (confirmAction?.type !== "gallery-delete") {
            return;
          }
          const id = confirmAction.id;
          runAction(`gallery-delete-${id}`, () =>
            deleteGalleryImageAction(media.productId, id),
          );
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === "technical-delete"}
        title="הסרת שרטוט טכני"
        description="להסיר את השרטוט הטכני?"
        confirmLabel="הסרה"
        tone="danger"
        loading={pendingKey === "technical-delete"}
        onConfirm={() => {
          runAction("technical-delete", () =>
            deleteTechnicalDrawingAction(media.productId),
          );
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

type PrimarySectionProps = {
  item: AdminMediaItemView | null;
  altText: string;
  inputId: string;
  isBusy: boolean;
  pendingKey: PendingKey;
  onAltChange: (value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAlt: () => void;
  onDelete: () => void;
};

function PrimarySection({
  item,
  altText,
  inputId,
  isBusy,
  pendingKey,
  onAltChange,
  onFileChange,
  onSaveAlt,
  onDelete,
}: PrimarySectionProps) {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subheading}>תמונה ראשית</h3>

      {item ? (
        <div className={styles.preview}>
          <Image
            src={item.url}
            alt={item.altText || "תמונה ראשית"}
            fill
            sizes="320px"
            className={styles.previewImage}
          />
        </div>
      ) : (
        <p className={styles.helperText}>לא הוגדרה תמונה ראשית.</p>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${inputId}-alt`}>
          טקסט חלופי
        </label>
        <input
          id={`${inputId}-alt`}
          className={styles.input}
          value={altText}
          onChange={(event) => onAltChange(event.target.value)}
          disabled={isBusy || !item}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy}
          loading={pendingKey === "primary-upload"}
          loadingLabel="מעבד..."
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {item ? "החלפת תמונה" : "העלאת תמונה"}
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={onFileChange}
          disabled={isBusy}
          hidden
        />

        {item ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveAlt}
              disabled={isBusy}
              loading={pendingKey === "primary-alt"}
              loadingLabel="שומר..."
            >
              שמירת alt
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={isBusy || pendingKey === "primary-delete"}
            >
              הסרה
            </Button>
          </>
        ) : null}
      </div>
      <p className={styles.helperText}>JPEG, PNG, WebP — עד 5 MB.</p>
    </div>
  );
}

type GallerySectionProps = {
  items: AdminMediaItemView[];
  galleryAlts: Record<string, string>;
  inputId: string;
  galleryFull: boolean;
  isBusy: boolean;
  pendingKey: PendingKey;
  onAltChange: (id: string, value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAlt: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

function GallerySection({
  items,
  galleryAlts,
  inputId,
  galleryFull,
  isBusy,
  pendingKey,
  onAltChange,
  onFileChange,
  onSaveAlt,
  onDelete,
  onMove,
}: GallerySectionProps) {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subheading}>
        גלריה ({items.length}/{GALLERY_MAX_COUNT})
      </h3>

      {items.length > 0 ? (
        <ul className={styles.galleryList}>
          {items.map((item, index) => (
            <li key={item.id} className={styles.galleryItem}>
              <Image
                src={item.url}
                alt={item.altText || "תמונת גלריה"}
                width={96}
                height={72}
                className={styles.galleryPreview}
              />
              <div className={styles.galleryMeta}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${inputId}-${item.id}-alt`}>
                    טקסט alt
                  </label>
                  <input
                    id={`${inputId}-${item.id}-alt`}
                    className={styles.input}
                    value={galleryAlts[item.id] ?? ""}
                    onChange={(event) => onAltChange(item.id, event.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <div className={styles.galleryActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMove(item.id, "up")}
                    disabled={isBusy || index === 0}
                    aria-label={`הזזת תמונה ${index + 1} למעלה`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMove(item.id, "down")}
                    disabled={isBusy || index === items.length - 1}
                    aria-label={`הזזת תמונה ${index + 1} למטה`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onSaveAlt(item.id)}
                    disabled={isBusy}
                    loading={pendingKey === `gallery-alt-${item.id}`}
                    loadingLabel="שומר..."
                  >
                    שמירת alt
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    disabled={isBusy || pendingKey === `gallery-delete-${item.id}`}
                  >
                    הסרה
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.helperText}>לא נוספו תמונות לגלריה.</p>
      )}

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy || galleryFull}
          loading={pendingKey === "gallery-upload"}
          loadingLabel="מעבד..."
          onClick={() => document.getElementById(inputId)?.click()}
        >
          הוספת תמונה לגלריה
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={onFileChange}
          disabled={isBusy || galleryFull}
          hidden
        />
      </div>
      <p className={styles.helperText}>JPEG, PNG, WebP — עד 5 MB לכל תמונה.</p>
    </div>
  );
}

type TechnicalSectionProps = {
  item: AdminMediaItemView | null;
  altText: string;
  inputId: string;
  isBusy: boolean;
  pendingKey: PendingKey;
  onAltChange: (value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAlt: () => void;
  onDelete: () => void;
};

function TechnicalSection({
  item,
  altText,
  inputId,
  isBusy,
  pendingKey,
  onAltChange,
  onFileChange,
  onSaveAlt,
  onDelete,
}: TechnicalSectionProps) {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subheading}>שרטוט טכני</h3>

      {item ? (
        <div className={styles.preview}>
          <Image
            src={item.url}
            alt={item.altText || "שרטוט טכני"}
            fill
            sizes="320px"
            className={styles.previewImage}
          />
        </div>
      ) : (
        <p className={styles.helperText}>לא הועלה שרטוט טכני.</p>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${inputId}-alt`}>
          טקסט alt
        </label>
        <input
          id={`${inputId}-alt`}
          className={styles.input}
          value={altText}
          onChange={(event) => onAltChange(event.target.value)}
          disabled={isBusy}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy}
          loading={pendingKey === "technical-upload"}
          loadingLabel="מעלה..."
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {item ? "החלפת שרטוט" : "העלאת שרטוט"}
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={onFileChange}
          disabled={isBusy}
          hidden
        />

        {item ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveAlt}
              disabled={isBusy}
              loading={pendingKey === "technical-alt"}
              loadingLabel="שומר..."
            >
              שמירת alt
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={isBusy || pendingKey === "technical-delete"}
            >
              הסרה
            </Button>
          </>
        ) : null}
      </div>
      <p className={styles.helperText}>JPEG, PNG, WebP — עד 10 MB.</p>
    </div>
  );
}
