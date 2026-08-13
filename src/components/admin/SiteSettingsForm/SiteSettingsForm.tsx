"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "@/app/admin/content/site/actions";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import CmsImageField from "@/components/admin/CmsImageField/CmsImageField";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { CMS_MEDIA_SCOPES } from "@/lib/cms/cms-media-scope";
import type { SiteSettingsFormInput } from "@/lib/cms/cms-validation";
import {
  mapSiteSettingsViewToFormInput,
  type SiteSettingsFormState,
} from "@/types/admin-site-settings";
import type { SiteSettingsView } from "@/types/cms-content";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type SiteSettingsFormProps = {
  initialSettings: SiteSettingsView;
};

const initialState: SiteSettingsFormState = {};

export default function SiteSettingsForm({
  initialSettings,
}: SiteSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [form, setForm] = useState<SiteSettingsFormInput>(() =>
    mapSiteSettingsViewToFormInput(initialSettings),
  );
  const [logo, setLogo] = useState(initialSettings.logo);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof SiteSettingsFormInput>(
    key: K,
    value: SiteSettingsFormInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result = await updateSiteSettingsAction(form);

      if (result.fieldErrors) {
        setFormState({ fieldErrors: result.fieldErrors });
        toast({ type: "error", message: "נא לתקן את השדות המסומנים." });
        return;
      }

      if (result.error) {
        setFormState({ error: result.error });
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הגדרות האתר נשמרו." });
      router.refresh();
    });
  };

  return (
    <div className={styles.stack}>
      <AdminDetailSection id="site-brand" title="מותג">
        <div className={styles.fieldGrid}>
          <FormField
            label="שם מותג"
            htmlFor="site-brand-name"
            error={formState.fieldErrors?.brandName}
          >
            <input
              id="site-brand-name"
              className={formFieldStyles.input}
              value={form.brandName}
              onChange={(event) => updateField("brandName", event.target.value)}
            />
          </FormField>

          <CmsImageField
            mediaScope={CMS_MEDIA_SCOPES.siteLogo}
            label="לוגו"
            value={logo}
            defaultAlt={form.brandName}
            onChange={setLogo}
          />
        </div>
      </AdminDetailSection>

      <AdminDetailSection id="site-contact" title="פרטי קשר">
        <div className={styles.fieldGrid}>
          <FormField
            label="אימייל"
            htmlFor="site-contact-email"
            error={formState.fieldErrors?.contactEmail}
          >
            <input
              id="site-contact-email"
              type="email"
              className={formFieldStyles.input}
              value={form.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
            />
          </FormField>

          <FormField
            label="טלפון"
            htmlFor="site-contact-phone"
            error={formState.fieldErrors?.contactPhone}
          >
            <input
              id="site-contact-phone"
              className={formFieldStyles.input}
              value={form.contactPhone}
              onChange={(event) => updateField("contactPhone", event.target.value)}
            />
          </FormField>

          <FormField
            label="WhatsApp"
            htmlFor="site-contact-whatsapp"
            error={formState.fieldErrors?.whatsappPhone}
          >
            <input
              id="site-contact-whatsapp"
              className={formFieldStyles.input}
              value={form.whatsappPhone}
              onChange={(event) => updateField("whatsappPhone", event.target.value)}
            />
          </FormField>

          <FormField
            label="כתובת"
            htmlFor="site-contact-address"
            error={formState.fieldErrors?.address}
          >
            <textarea
              id="site-contact-address"
              className={formFieldStyles.input}
              rows={3}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </FormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection id="site-footer" title="Footer">
        <div className={styles.fieldGrid}>
          <FormField
            label="תיאור בפוטר"
            htmlFor="site-footer-description"
            error={formState.fieldErrors?.footerDescription}
          >
            <textarea
              id="site-footer-description"
              className={formFieldStyles.input}
              rows={3}
              value={form.footerDescription}
              onChange={(event) => updateField("footerDescription", event.target.value)}
            />
          </FormField>

          <FormField
            label="שם חברה לזכויות יוצרים"
            htmlFor="site-copyright"
            error={formState.fieldErrors?.copyrightCompanyName}
          >
            <input
              id="site-copyright"
              className={formFieldStyles.input}
              value={form.copyrightCompanyName}
              onChange={(event) =>
                updateField("copyrightCompanyName", event.target.value)
              }
            />
          </FormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection id="site-seo" title="SEO בסיסי">
        <div className={styles.fieldGrid}>
          <FormField
            label="כותרת ברירת מחדל"
            htmlFor="site-seo-title"
            error={formState.fieldErrors?.seoDefaultTitle}
          >
            <input
              id="site-seo-title"
              className={formFieldStyles.input}
              value={form.seoDefaultTitle}
              onChange={(event) => updateField("seoDefaultTitle", event.target.value)}
            />
          </FormField>

          <FormField
            label="תיאור ברירת מחדל"
            htmlFor="site-seo-description"
            error={formState.fieldErrors?.seoDefaultDescription}
          >
            <textarea
              id="site-seo-description"
              className={formFieldStyles.input}
              rows={3}
              value={form.seoDefaultDescription}
              onChange={(event) =>
                updateField("seoDefaultDescription", event.target.value)
              }
            />
          </FormField>
        </div>
      </AdminDetailSection>

      <div className={styles.actions}>
        <Button type="button" onClick={handleSubmit} loading={isPending}>
          שמירה
        </Button>
        <Button href="/admin/content" variant="ghost">
          חזרה לתוכן
        </Button>
      </div>
    </div>
  );
}
