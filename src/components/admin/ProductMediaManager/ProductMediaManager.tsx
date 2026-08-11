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
  updateGalleryAltTextAction,
  updatePrimaryAltTextAction,
  updateTechnicalAltTextAction,
} from "@/app/admin/products/media-actions";
import { GALLERY_MAX_COUNT } from "@/lib/media/media-validation";
import type {
  AdminMediaItemView,
  AdminProductMediaView,
  MediaSlot,
} from "@/types/admin-product-media";
import { validateFileForSlotClient } from "@/lib/media/media-validation";
import styles from "./ProductMediaManager.module.scss";

type ProductMediaManagerProps = {
  media: AdminProductMediaView;
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

export default function ProductMediaManager({ media }: ProductMediaManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<PendingKey>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    setPendingKey(key);

    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) {
          setError(result.error);
        } else {
          setSuccess(successMessage ?? "הפעולה בוצעה בהצלחה.");
          router.refresh();
        }
      } catch {
        setError("אירעה שגיאה. נסו שוב.");
      } finally {
        setPendingKey(null);
      }
    });
  };

  const handleUpload = async (slot: MediaSlot, file: File, altText?: string) => {
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
    setSuccess(null);
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
          return;
        }

        const blob = await upload(prepared.pathname, file, {
          access: "public",
          handleUploadUrl: `/api/admin/products/${media.productId}/media/upload`,
          clientPayload: prepared.clientPayload,
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
        });

        if (finalize.error) {
          setError(finalize.error);
          return;
        }

        setSuccess("הקובץ הועלה בהצלחה.");
        router.refresh();
      } catch {
        setError("אירעה שגיאה בהעלאת הקובץ.");
      } finally {
        setPendingKey(null);
      }
    });
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

    void handleUpload(slot, file, altText);
  };

  const galleryCount = media.gallery.length;
  const galleryFull = galleryCount >= GALLERY_MAX_COUNT;

  return (
    <section className={styles.section} aria-labelledby="product-media-title">
      <div>
        <h2 id="product-media-title" className={styles.sectionTitle}>
          ניהול מדיה
        </h2>
        <p className={styles.sectionDescription}>
          ניהול תמונה ראשית, גלריה ושרטוט טכני למוצר.
        </p>
      </div>

      {error ? <p className={styles.messageError}>{error}</p> : null}
      {success ? <p className={styles.messageSuccess}>{success}</p> : null}

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
        onDelete={() => {
          if (!window.confirm("להסיר את התמונה הראשית?")) {
            return;
          }
          runAction("primary-delete", () =>
            deletePrimaryImageAction(media.productId),
          );
        }}
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
        onDelete={(id) => {
          if (!window.confirm("להסיר תמונה זו מהגלריה?")) {
            return;
          }
          runAction(`gallery-delete-${id}`, () =>
            deleteGalleryImageAction(media.productId, id),
          );
        }}
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
        onDelete={() => {
          if (!window.confirm("להסיר את השרטוט הטכני?")) {
            return;
          }
          runAction("technical-delete", () =>
            deleteTechnicalDrawingAction(media.productId),
          );
        }}
      />
    </section>
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
          טקסט alt
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
        <label className={styles.button} htmlFor={inputId}>
          {item ? "החלפת תמונה" : "העלאת תמונה"}
        </label>
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
            <button
              type="button"
              className={styles.button}
              onClick={onSaveAlt}
              disabled={isBusy || pendingKey === "primary-alt"}
            >
              שמירת alt
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={onDelete}
              disabled={isBusy || pendingKey === "primary-delete"}
            >
              הסרה
            </button>
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
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => onMove(item.id, "up")}
                    disabled={isBusy || index === 0}
                    aria-label={`הזזת תמונה ${index + 1} למעלה`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => onMove(item.id, "down")}
                    disabled={isBusy || index === items.length - 1}
                    aria-label={`הזזת תמונה ${index + 1} למטה`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => onSaveAlt(item.id)}
                    disabled={isBusy || pendingKey === `gallery-alt-${item.id}`}
                  >
                    שמירת alt
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => onDelete(item.id)}
                    disabled={isBusy || pendingKey === `gallery-delete-${item.id}`}
                  >
                    הסרה
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.helperText}>לא נוספו תמונות לגלריה.</p>
      )}

      <div className={styles.actions}>
        <label
          className={galleryFull ? styles.iconButton : styles.button}
          htmlFor={inputId}
          aria-disabled={galleryFull || isBusy}
        >
          הוספת תמונה לגלריה
        </label>
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
        <label className={styles.button} htmlFor={inputId}>
          {item ? "החלפת שרטוט" : "העלאת שרטוט"}
        </label>
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
            <button
              type="button"
              className={styles.button}
              onClick={onSaveAlt}
              disabled={isBusy || pendingKey === "technical-alt"}
            >
              שמירת alt
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={onDelete}
              disabled={isBusy || pendingKey === "technical-delete"}
            >
              הסרה
            </button>
          </>
        ) : null}
      </div>
      <p className={styles.helperText}>JPEG, PNG, WebP — עד 10 MB.</p>
    </div>
  );
}
