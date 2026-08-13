"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import {
  finalizeCmsImageUploadAction,
  prepareCmsImageUploadAction,
  removeCmsImageAction,
} from "@/app/admin/content/cms-media-actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { CmsMediaScope } from "@/lib/cms/cms-media-scope";
import { validateCmsImageFileClient } from "@/lib/cms/cms-media-validation";
import type { CmsImageView } from "@/types/cms-content";
import styles from "./CmsImageField.module.scss";

type CmsImageFieldProps = {
  mediaScope: CmsMediaScope;
  label: string;
  value?: CmsImageView;
  defaultAlt: string;
  itemId?: string;
  disabled?: boolean;
  disabledHelpText?: string;
  allowDecorative?: boolean;
  onChange?: (value: CmsImageView | undefined) => void;
};

export default function CmsImageField({
  mediaScope,
  label,
  value,
  defaultAlt,
  itemId,
  disabled = false,
  disabledHelpText,
  allowDecorative = false,
  onChange,
}: CmsImageFieldProps) {
  const router = useRouter();
  const { toast } = useToast();
  const inputId = useId();
  const [isPending, startTransition] = useTransition();
  const [alt, setAlt] = useState(value?.alt ?? defaultAlt);
  const [isDecorative, setIsDecorative] = useState(value?.isDecorative ?? false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    if (disabled) {
      return;
    }

    const validation = validateCmsImageFileClient(file);
    if (!validation.ok) {
      setError(validation.message);
      toast({ type: "error", message: validation.message });
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const prepared = await prepareCmsImageUploadAction(
          mediaScope,
          file.name,
          alt.trim() || defaultAlt,
          itemId,
        );

        if ("error" in prepared) {
          setError(prepared.error);
          toast({ type: "error", message: prepared.error });
          return;
        }

        const blob = await upload(prepared.pathname, file, {
          access: "public",
          handleUploadUrl: "/api/admin/cms/media/upload",
          clientPayload: prepared.clientPayload,
          contentType: file.type,
        });

        const result = await finalizeCmsImageUploadAction({
          mediaScope,
          pathname: blob.pathname,
          url: blob.url,
          alt: alt.trim() || defaultAlt,
          itemId,
          isDecorative: allowDecorative ? isDecorative : false,
        });

        if (result.error) {
          setError(result.error);
          toast({ type: "error", message: result.error });
          return;
        }

        const nextValue: CmsImageView = {
          url: blob.url,
          storageKey: blob.pathname,
          alt: alt.trim() || defaultAlt,
          isDecorative: allowDecorative ? isDecorative : false,
        };

        onChange?.(nextValue);
        toast({ type: "success", message: "התמונה הועלתה בהצלחה." });
        router.refresh();
      } catch {
        const message = "אירעה שגיאה בהעלאת התמונה. נסו שוב.";
        setError(message);
        toast({ type: "error", message });
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeCmsImageAction({ mediaScope, itemId });

      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      onChange?.(undefined);
      toast({ type: "success", message: "התמונה הוסרה." });
      setConfirmRemove(false);
      router.refresh();
    });
  };

  return (
    <div className={styles.field}>
      <p className={styles.label}>{label}</p>

      {value ? (
        <div className={styles.previewWrap}>
          <Image
            src={value.url}
            alt={value.alt ?? defaultAlt}
            width={value.width ?? 160}
            height={value.height ?? 48}
            className={styles.preview}
            sizes="160px"
          />
        </div>
      ) : (
        <p className={styles.empty}>לא הועלתה תמונה</p>
      )}

      <FormField label="טקסט חלופי" htmlFor={`${inputId}-alt`}>
        <input
          id={`${inputId}-alt`}
          className={formFieldStyles.input}
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder={defaultAlt}
          disabled={disabled || isPending}
        />
      </FormField>

      {allowDecorative ? (
        <label className={styles.decorativeToggle}>
          <input
            type="checkbox"
            checked={isDecorative}
            onChange={(event) => setIsDecorative(event.target.checked)}
            disabled={disabled || isPending}
          />
          <span>תמונה דקורטיבית (ללא טקסט חלופי נדרש)</span>
        </label>
      ) : null}

      {disabled && disabledHelpText ? (
        <p className={styles.help}>{disabledHelpText}</p>
      ) : null}

      <div className={styles.actions}>
        <label className={styles.fileButton}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            disabled={disabled || isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={isPending}
            disabled={disabled}
          >
            {value ? "החלפת תמונה" : "העלאת תמונה"}
          </Button>
        </label>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPending}
            onClick={() => setConfirmRemove(true)}
          >
            הסרת תמונה
          </Button>
        ) : null}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <ConfirmDialog
        open={confirmRemove}
        title="הסרת תמונה"
        description="האם להסיר את התמונה מהאתר?"
        confirmLabel="הסרה"
        tone="danger"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
