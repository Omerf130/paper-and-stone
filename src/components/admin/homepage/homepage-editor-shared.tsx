"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { CmsCtaView } from "@/types/cms-content";
import formStyles from "@/components/admin/ProductForm/form-section.module.scss";
import homepageStyles from "./homepage-editor.module.scss";

type SectionShellProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function HomepageSectionShell({
  id,
  title,
  description,
  children,
}: SectionShellProps) {
  return (
    <div id={id} className={homepageStyles.sectionAnchor}>
      <AdminDetailSection title={title} description={description}>
        <div className={formStyles.section}>{children}</div>
      </AdminDetailSection>
    </div>
  );
}

type SaveSectionButtonProps = {
  label?: string;
  loading?: boolean;
  onClick: () => void;
};

export function SaveSectionButton({
  label = "שמירת סקשן",
  loading = false,
  onClick,
}: SaveSectionButtonProps) {
  return (
    <div className={homepageStyles.saveRow}>
      <Button type="button" onClick={onClick} loading={loading}>
        {label}
      </Button>
    </div>
  );
}

export function VisibilityToggle({
  id,
  checked,
  onChange,
  label = "הצגה בדף הבית",
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className={homepageStyles.visibilityToggle} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function CtaFields({
  prefix,
  value,
  onChange,
  fieldErrors,
}: {
  prefix: string;
  value: CmsCtaView;
  onChange: (value: CmsCtaView) => void;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <div className={homepageStyles.ctaGrid}>
      <FormField
        label="תווית"
        htmlFor={`${prefix}-label`}
        error={fieldErrors?.[`${prefix}.label`]}
      >
        <input
          id={`${prefix}-label`}
          className={formFieldStyles.input}
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
        />
      </FormField>
      <FormField
        label="קישור פנימי"
        htmlFor={`${prefix}-href`}
        error={fieldErrors?.[`${prefix}.href`]}
        hint='לדוגמה: /products או /register'
      >
        <input
          id={`${prefix}-href`}
          className={`${formFieldStyles.input} ${homepageStyles.ltrInput}`}
          dir="ltr"
          value={value.href}
          onChange={(event) => onChange({ ...value, href: event.target.value })}
        />
      </FormField>
      <VisibilityToggle
        id={`${prefix}-visible`}
        checked={value.isVisible ?? true}
        onChange={(isVisible) => onChange({ ...value, isVisible })}
        label="הצגת כפתור"
      />
    </div>
  );
}

export function ArrayOrderButtons({
  index,
  total,
  onMoveUp,
  onMoveDown,
  itemLabel,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  itemLabel: string;
}) {
  return (
    <div className={homepageStyles.orderButtons}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={index === 0}
        onClick={onMoveUp}
        aria-label={`הזזת ${itemLabel} למעלה`}
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={index >= total - 1}
        onClick={onMoveDown}
        aria-label={`הזזת ${itemLabel} למטה`}
      >
        ↓
      </Button>
    </div>
  );
}

export function useHomepageSectionSave<T>(
  saveAction: (input: T) => Promise<{ success?: boolean; error?: string; fieldErrors?: Record<string, string> }>,
) {
  const router = useRouter();
  const { toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const save = (input: T, successMessage: string) => {
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveAction(input);

      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors);
        toast({ type: "error", message: "נא לתקן את השדות המסומנים." });
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: successMessage });
      router.refresh();
    });
  };

  return { save, fieldErrors, isPending };
}

export function AdminInlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={homepageStyles.inlineLink}>
      {children}
    </Link>
  );
}

export function DefaultContentBanner() {
  return (
    <p className={homepageStyles.defaultBanner} role="status">
      התוכן הנוכחי מבוסס על ברירת המחדל. שמירה תעביר את הסקשן לניהול דרך המערכת.
    </p>
  );
}
