"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateMyProfessionalProfileAction } from "@/app/professional/profile/actions";
import type {
  ProfessionalProfileFormInput,
  ProfessionalProfileFormState,
} from "@/types/professional-profile";
import styles from "@/components/admin/ProductForm/form-section.module.scss";

type ProfessionalProfileFormProps = {
  initialProfile: ProfessionalProfileFormInput;
  showSavedBanner?: boolean;
};

const initialState: ProfessionalProfileFormState = {};

export default function ProfessionalProfileForm({
  initialProfile,
  showSavedBanner = false,
}: ProfessionalProfileFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

  const updateField = <K extends keyof ProfessionalProfileFormInput>(
    key: K,
    value: ProfessionalProfileFormInput[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result = await updateMyProfessionalProfileAction(profile);
      setFormState(result);

      if (result.success) {
        setSavedBanner(true);
        router.refresh();
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      {(savedBanner || showSavedBanner) && (
        <p className={styles.formSuccess} role="status">
          הפרופיל נשמר בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטים אישיים</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>
              שם מלא
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={styles.input}
              value={profile.fullName ?? ""}
              onChange={(event) => updateField("fullName", event.target.value)}
              autoComplete="name"
            />
            {fieldErrors.fullName && (
              <p className={styles.fieldError}>{fieldErrors.fullName}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              טלפון
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={styles.input}
              value={profile.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
            />
            {fieldErrors.phone && (
              <p className={styles.fieldError}>{fieldErrors.phone}</p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטים מקצועיים</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="companyName" className={styles.label}>
              שם חברה / משרד
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className={styles.input}
              value={profile.companyName ?? ""}
              onChange={(event) =>
                updateField("companyName", event.target.value)
              }
              autoComplete="organization"
            />
            {fieldErrors.companyName && (
              <p className={styles.fieldError}>{fieldErrors.companyName}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>
              עיר
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className={styles.input}
              value={profile.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              autoComplete="address-level2"
            />
            {fieldErrors.city && (
              <p className={styles.fieldError}>{fieldErrors.city}</p>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="bio" className={styles.label}>
            אודות
          </label>
          <textarea
            id="bio"
            name="bio"
            className={styles.textarea}
            value={profile.bio ?? ""}
            onChange={(event) => updateField("bio", event.target.value)}
            rows={5}
          />
          {fieldErrors.bio && (
            <p className={styles.fieldError}>{fieldErrors.bio}</p>
          )}
        </div>
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "שומר..." : "שמירה"}
        </button>
        <Link href="/professional" className={styles.cancelLink}>
          חזרה לראשי
        </Link>
      </div>
    </div>
  );
}
