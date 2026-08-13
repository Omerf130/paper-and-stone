"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateMyProfessionalProfileAction } from "@/app/professional/profile/actions";
import Button from "@/components/ui/Button/Button";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import {
  getProfileCompletenessSummary,
} from "@/lib/professionals/profile-completeness";
import type {
  ProfessionalProfileFormInput,
  ProfessionalProfileFormState,
} from "@/types/professional-profile";
import styles from "@/components/professional/professional-form.module.scss";

type ProfessionalProfileFormProps = {
  initialProfile: ProfessionalProfileFormInput;
};

const initialState: ProfessionalProfileFormState = {};

export default function ProfessionalProfileForm({
  initialProfile,
}: ProfessionalProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();

  const completeness = getProfileCompletenessSummary(profile);

  const updateField = <K extends keyof ProfessionalProfileFormInput>(
    key: K,
    value: ProfessionalProfileFormInput[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result = await updateMyProfessionalProfileAction(profile);
      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הפרופיל נשמר" });
      router.refresh();
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      {!completeness.isComplete ? (
        <FeedbackBanner tone="info">
          הושלמו {completeness.filledCount} מתוך {completeness.totalCount} שדות.
          {completeness.missingFields.length > 0
            ? ` חסרים: ${completeness.missingFields.join(", ")}.`
            : null}
        </FeedbackBanner>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטים אישיים</h2>
        <div className={styles.fieldGrid}>
          <FormField label="שם מלא" htmlFor="fullName" error={fieldErrors.fullName}>
            <input
              id="fullName"
              className={formFieldStyles.input}
              value={profile.fullName ?? ""}
              onChange={(event) => updateField("fullName", event.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
          </FormField>

          <FormField label="טלפון" htmlFor="phone" error={fieldErrors.phone}>
            <input
              id="phone"
              className={formFieldStyles.input}
              value={profile.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
            />
          </FormField>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי משרד</h2>
        <div className={styles.fieldGrid}>
          <FormField
            label="שם חברה / משרד"
            htmlFor="companyName"
            error={fieldErrors.companyName}
          >
            <input
              id="companyName"
              className={formFieldStyles.input}
              value={profile.companyName ?? ""}
              onChange={(event) => updateField("companyName", event.target.value)}
              autoComplete="organization"
              aria-invalid={Boolean(fieldErrors.companyName)}
            />
          </FormField>

          <FormField label="עיר" htmlFor="city" error={fieldErrors.city}>
            <input
              id="city"
              className={formFieldStyles.input}
              value={profile.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              autoComplete="address-level2"
              aria-invalid={Boolean(fieldErrors.city)}
            />
          </FormField>

          <div className={styles.fullWidth}>
            <FormField label="אודות" htmlFor="bio" error={fieldErrors.bio}>
              <textarea
                id="bio"
                className={formFieldStyles.textarea}
                value={profile.bio ?? ""}
                onChange={(event) => updateField("bio", event.target.value)}
                rows={5}
                aria-invalid={Boolean(fieldErrors.bio)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="שומר...">
          שמירה
        </Button>
        <Link href="/professional" className={styles.cancelLink}>
          חזרה לראשי
        </Link>
      </div>
    </div>
  );
}
