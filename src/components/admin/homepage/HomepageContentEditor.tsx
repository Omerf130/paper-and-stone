"use client";

import { useMemo, useState } from "react";
import {
  saveHomepageAboutAction,
  saveHomepageCategoriesAction,
  saveHomepageClosingAction,
  saveHomepageFeaturedAction,
  saveHomepageHeroAction,
  saveHomepageInspirationAction,
  saveHomepageProfessionalsAction,
  saveHomepageSectionOrderAction,
} from "@/app/admin/content/homepage/actions";
import CmsImageField from "@/components/admin/CmsImageField/CmsImageField";
import AdminHomepageSectionNav from "@/components/admin/homepage/AdminHomepageSectionNav";
import {
  AdminInlineLink,
  ArrayOrderButtons,
  CtaFields,
  DefaultContentBanner,
  HomepageSectionShell,
  SaveSectionButton,
  useHomepageSectionSave,
  VisibilityToggle,
} from "@/components/admin/homepage/homepage-editor-shared";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { CMS_LIMITS } from "@/lib/cms/cms-constants";
import { CMS_MEDIA_SCOPES } from "@/lib/cms/cms-media-scope";
import {
  moveArrayItemDown,
  moveArrayItemUp,
  moveSectionOrderDown,
  moveSectionOrderUp,
} from "@/lib/cms/homepage-array-helpers";
import type {
  AdminHomepageCategoryTileState,
  AdminHomepageContentPayload,
} from "@/types/admin-homepage-content";
import {
  HOMEPAGE_SECTION_LABELS,
  mapHomepageAboutToFormInput,
  mapHomepageCategoriesToFormInput,
  mapHomepageClosingToFormInput,
  mapHomepageFeaturedToFormInput,
  mapHomepageHeroToFormInput,
  mapHomepageInspirationToFormInput,
  mapHomepageProfessionalsToFormInput,
  mapHomepageSectionOrderToFormInput,
} from "@/types/admin-homepage-content";
import type {
  HomepageAboutFormInput,
  HomepageCategoriesFormInput,
  HomepageClosingFormInput,
  HomepageFeaturedProductsFormInput,
  HomepageHeroFormInput,
  HomepageInspirationFormInput,
  HomepageProfessionalsFormInput,
} from "@/lib/cms/cms-validation";
import type { HomepageSectionKey } from "@/types/cms-content";
import type { CmsImageView } from "@/types/cms-content";
import formStyles from "@/components/admin/ProductForm/form-section.module.scss";
import styles from "@/components/admin/homepage/homepage-editor.module.scss";

type FormCmsImage = HomepageHeroFormInput["image"];

function normalizeFormImage(image: CmsImageView | undefined): FormCmsImage {
  return image as FormCmsImage;
}

type HomepageContentEditorProps = AdminHomepageContentPayload & {
  persistedItemIds: string[];
};

function createEmptyCategoryTile(order: number): HomepageCategoriesFormInput["items"][number] {
  return {
    id: crypto.randomUUID(),
    displayTitle: undefined,
    layout: "medium",
    isVisible: true,
    order,
  };
}

function createEmptyInspirationItem(order: number) {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    layout: "standard" as const,
    isVisible: true,
    order,
  };
}

function createEmptyProfessionalStep(order: number) {
  return {
    id: crypto.randomUUID(),
    step: String(order + 1).padStart(2, "0"),
    title: "",
    order,
  };
}

export default function HomepageContentEditor({
  content,
  documentExists,
  categoryOptions,
  categoryTileStates,
  persistedItemIds,
}: HomepageContentEditorProps) {
  const persistedIdSet = useMemo(() => new Set(persistedItemIds), [persistedItemIds]);

  const [hero, setHero] = useState(() =>
    mapHomepageHeroToFormInput(content.hero as HomepageHeroFormInput),
  );
  const [categories, setCategories] = useState(() =>
    mapHomepageCategoriesToFormInput(content.categories as HomepageCategoriesFormInput),
  );
  const [featured, setFeatured] = useState(() =>
    mapHomepageFeaturedToFormInput(
      content.featuredProducts as HomepageFeaturedProductsFormInput,
    ),
  );
  const [about, setAbout] = useState(() =>
    mapHomepageAboutToFormInput(content.about as HomepageAboutFormInput),
  );
  const [professionals, setProfessionals] = useState(() =>
    mapHomepageProfessionalsToFormInput(
      content.professionals as HomepageProfessionalsFormInput,
    ),
  );
  const [inspiration, setInspiration] = useState(() =>
    mapHomepageInspirationToFormInput(content.inspiration as HomepageInspirationFormInput),
  );
  const [closing, setClosing] = useState(() =>
    mapHomepageClosingToFormInput(content.closing as HomepageClosingFormInput),
  );
  const [sectionOrder, setSectionOrder] = useState<HomepageSectionKey[]>(() =>
    mapHomepageSectionOrderToFormInput(content.sectionOrder),
  );

  const heroSave = useHomepageSectionSave(saveHomepageHeroAction);
  const categoriesSave = useHomepageSectionSave(saveHomepageCategoriesAction);
  const featuredSave = useHomepageSectionSave(saveHomepageFeaturedAction);
  const aboutSave = useHomepageSectionSave(saveHomepageAboutAction);
  const professionalsSave = useHomepageSectionSave(saveHomepageProfessionalsAction);
  const inspirationSave = useHomepageSectionSave(saveHomepageInspirationAction);
  const closingSave = useHomepageSectionSave(saveHomepageClosingAction);
  const sectionOrderSave = useHomepageSectionSave(saveHomepageSectionOrderAction);

  const categoryOptionMap = useMemo(
    () => new Map(categoryOptions.map((option) => [option.id, option])),
    [categoryOptions],
  );

  const updateCategoryTile = (
    index: number,
    patch: Partial<HomepageCategoriesFormInput["items"][number]>,
  ) => {
    setCategories((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const renderCategoryWarning = (
    itemId: string,
    state: AdminHomepageCategoryTileState | undefined,
  ) => {
    if (!state || state.status === "active" || state.status === "unassigned") {
      return null;
    }

    if (state.status === "missing") {
      return (
        <p className={styles.warning} role="alert">
          הקטגוריה שנבחרה כבר לא קיימת במערכת. בחרו קטגוריה אחרת או הסירו את הפריט.
        </p>
      );
    }

    return (
      <p className={styles.warning} role="alert">
        הקטגוריה {state.nameHe} אינה פעילה. הפריט יישאר לעריכה, אך לא יוצג בדף הבית
        לאחר החיבור הציבורי.
      </p>
    );
  };

  return (
    <div className={styles.editorLayout}>
      <AdminHomepageSectionNav />

      {!documentExists ? <DefaultContentBanner /> : null}

      <HomepageSectionShell
        id="homepage-hero"
        title="Hero"
        description="כותרת ראשית, טקסט תומך, תמונה וקריאות לפעולה."
      >
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="hero-eyebrow">
            <input
              id="hero-eyebrow"
              className={formFieldStyles.input}
              value={hero.eyebrow}
              onChange={(event) => setHero({ ...hero, eyebrow: event.target.value })}
            />
          </FormField>
          <FormField label="כותרת" htmlFor="hero-heading">
            <input
              id="hero-heading"
              className={formFieldStyles.input}
              value={hero.heading}
              onChange={(event) => setHero({ ...hero, heading: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label="טקסט תומך" htmlFor="hero-supporting">
          <textarea
            id="hero-supporting"
            className={formFieldStyles.textarea}
            rows={3}
            value={hero.supportingText}
            onChange={(event) => setHero({ ...hero, supportingText: event.target.value })}
          />
        </FormField>
        <CmsImageField
          mediaScope={CMS_MEDIA_SCOPES.homepageHero}
          label="תמונת Hero"
          value={hero.image}
          defaultAlt={hero.heading}
          allowDecorative
          onChange={(image) => setHero({ ...hero, image: normalizeFormImage(image) })}
        />
        <CtaFields
          prefix="primaryCta"
          value={hero.primaryCta}
          onChange={(primaryCta) => setHero({ ...hero, primaryCta })}
          fieldErrors={heroSave.fieldErrors}
        />
        <CtaFields
          prefix="secondaryCta"
          value={hero.secondaryCta}
          onChange={(secondaryCta) => setHero({ ...hero, secondaryCta })}
          fieldErrors={heroSave.fieldErrors}
        />
        <SaveSectionButton
          loading={heroSave.isPending}
          onClick={() => heroSave.save({ ...hero, isVisible: true }, "סקשן Hero נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-categories"
        title="קטגוריות"
        description="תצוגת קטגוריות — בוחרים קטגוריות מהמערכת ומגדירים תמונה ופריסה."
      >
        <VisibilityToggle
          id="categories-visible"
          checked={categories.isVisible}
          onChange={(isVisible) => setCategories({ ...categories, isVisible })}
        />
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="categories-eyebrow">
            <input
              id="categories-eyebrow"
              className={formFieldStyles.input}
              value={categories.eyebrow}
              onChange={(event) =>
                setCategories({ ...categories, eyebrow: event.target.value })
              }
            />
          </FormField>
          <FormField label="כותרת" htmlFor="categories-heading">
            <input
              id="categories-heading"
              className={formFieldStyles.input}
              value={categories.heading}
              onChange={(event) =>
                setCategories({ ...categories, heading: event.target.value })
              }
            />
          </FormField>
        </div>
        <FormField label="טקסט תומך" htmlFor="categories-supporting">
          <textarea
            id="categories-supporting"
            className={formFieldStyles.textarea}
            rows={3}
            value={categories.supportingText}
            onChange={(event) =>
              setCategories({ ...categories, supportingText: event.target.value })
            }
          />
        </FormField>

        <div className={styles.fullWidth}>
          {categories.items.map((item, index) => {
            const selectedCategory = item.categoryId
              ? categoryOptionMap.get(item.categoryId)
              : undefined;
            const tileState = categoryTileStates[item.id];
            const imageDisabled = !documentExists && !persistedIdSet.has(item.id);

            return (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemCardHeader}>
                  <h3 className={styles.itemCardTitle}>אריח {index + 1}</h3>
                  <ArrayOrderButtons
                    index={index}
                    total={categories.items.length}
                    itemLabel={`אריח ${index + 1}`}
                    onMoveUp={() =>
                      setCategories({
                        ...categories,
                        items: moveArrayItemUp(categories.items, index),
                      })
                    }
                    onMoveDown={() =>
                      setCategories({
                        ...categories,
                        items: moveArrayItemDown(categories.items, index),
                      })
                    }
                  />
                </div>

                {renderCategoryWarning(item.id, tileState)}

                <FormField label="קטגוריה" htmlFor={`category-${item.id}`}>
                  <select
                    id={`category-${item.id}`}
                    className={formFieldStyles.select}
                    value={item.categoryId ?? ""}
                    onChange={(event) =>
                      updateCategoryTile(index, {
                        categoryId: event.target.value || undefined,
                      })
                    }
                  >
                    <option value="">בחרו קטגוריה</option>
                    {categoryOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nameHe}
                        {!option.isActive ? " (לא פעילה)" : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                {selectedCategory ? (
                  <p className={styles.helperText}>
                    שם במערכת: {selectedCategory.nameHe} ({selectedCategory.slug})
                  </p>
                ) : null}

                <FormField
                  label="כותרת תצוגה (אופציונלי)"
                  htmlFor={`category-title-${item.id}`}
                  hint="אם ריק — בדף הציבורי יוצג שם הקטגוריה בעברית."
                >
                  <input
                    id={`category-title-${item.id}`}
                    className={formFieldStyles.input}
                    value={item.displayTitle ?? ""}
                    onChange={(event) =>
                      updateCategoryTile(index, {
                        displayTitle: event.target.value || undefined,
                      })
                    }
                  />
                </FormField>

                <FormField label="פריסה" htmlFor={`category-layout-${item.id}`}>
                  <select
                    id={`category-layout-${item.id}`}
                    className={formFieldStyles.select}
                    value={item.layout}
                    onChange={(event) =>
                      updateCategoryTile(index, {
                        layout: event.target.value as "large" | "medium",
                      })
                    }
                  >
                    <option value="large">גדול</option>
                    <option value="medium">בינוני</option>
                  </select>
                </FormField>

                <VisibilityToggle
                  id={`category-visible-${item.id}`}
                  checked={item.isVisible}
                  onChange={(isVisible) => updateCategoryTile(index, { isVisible })}
                  label="הצגת אריח"
                />

                <CmsImageField
                  mediaScope={CMS_MEDIA_SCOPES.homepageCategory}
                  label="תמונת אריח"
                  value={item.image}
                  defaultAlt={item.displayTitle ?? selectedCategory?.nameHe ?? "קטגוריה"}
                  itemId={item.id}
                  disabled={imageDisabled}
                  disabledHelpText="שמרו את הסקשן לפני העלאת תמונה."
                  onChange={(image) =>
                    updateCategoryTile(index, { image: normalizeFormImage(image) })
                  }
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCategories({
                      ...categories,
                      items: categories.items.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                >
                  הסרת אריח
                </Button>
              </article>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={categories.items.length >= CMS_LIMITS.homepageCategoryItems}
          onClick={() =>
            setCategories({
              ...categories,
              items: [...categories.items, createEmptyCategoryTile(categories.items.length)],
            })
          }
        >
          הוספת אריח
        </Button>

        <SaveSectionButton
          loading={categoriesSave.isPending}
          onClick={() => categoriesSave.save(categories, "סקשן הקטגוריות נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-featured"
        title="מוצרים נבחרים"
        description="תצוגת הסקשן בלבד. המוצרים נבחרים דרך ניהול המוצרים."
      >
        <VisibilityToggle
          id="featured-visible"
          checked={featured.isVisible}
          onChange={(isVisible) => setFeatured({ ...featured, isVisible })}
        />
        <p className={styles.helperText}>
          מוצרים מומלצים מסומנים כ-featured ב
          <AdminInlineLink href="/admin/products"> ניהול מוצרים מומלצים</AdminInlineLink>.
        </p>
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="featured-eyebrow">
            <input
              id="featured-eyebrow"
              className={formFieldStyles.input}
              value={featured.eyebrow}
              onChange={(event) => setFeatured({ ...featured, eyebrow: event.target.value })}
            />
          </FormField>
          <FormField label="כותרת" htmlFor="featured-heading">
            <input
              id="featured-heading"
              className={formFieldStyles.input}
              value={featured.heading}
              onChange={(event) => setFeatured({ ...featured, heading: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label="טקסט תומך" htmlFor="featured-supporting">
          <textarea
            id="featured-supporting"
            className={formFieldStyles.textarea}
            rows={2}
            value={featured.supportingText ?? ""}
            onChange={(event) =>
              setFeatured({
                ...featured,
                supportingText: event.target.value || undefined,
              })
            }
          />
        </FormField>
        <CtaFields
          prefix="cta"
          value={featured.cta}
          onChange={(cta) => setFeatured({ ...featured, cta })}
          fieldErrors={featuredSave.fieldErrors}
        />
        <SaveSectionButton
          loading={featuredSave.isPending}
          onClick={() => featuredSave.save(featured, "סקשן המוצרים הנבחרים נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-about"
        title="אודות"
        description="טקסט מותג ותמונה."
      >
        <VisibilityToggle
          id="about-visible"
          checked={about.isVisible}
          onChange={(isVisible) => setAbout({ ...about, isVisible })}
        />
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="about-eyebrow">
            <input
              id="about-eyebrow"
              className={formFieldStyles.input}
              value={about.eyebrow}
              onChange={(event) => setAbout({ ...about, eyebrow: event.target.value })}
            />
          </FormField>
          <FormField label="כותרת" htmlFor="about-heading">
            <input
              id="about-heading"
              className={formFieldStyles.input}
              value={about.heading}
              onChange={(event) => setAbout({ ...about, heading: event.target.value })}
            />
          </FormField>
        </div>
        <FormField label="תוכן" htmlFor="about-body">
          <textarea
            id="about-body"
            className={formFieldStyles.textarea}
            rows={6}
            value={about.body}
            onChange={(event) => setAbout({ ...about, body: event.target.value })}
          />
        </FormField>
        <CmsImageField
          mediaScope={CMS_MEDIA_SCOPES.homepageAbout}
          label="תמונת אודות"
          value={about.image}
          defaultAlt={about.heading}
          onChange={(image) => setAbout({ ...about, image: normalizeFormImage(image) })}
        />
        <SaveSectionButton
          loading={aboutSave.isPending}
          onClick={() => aboutSave.save(about, "סקשן האודות נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-professionals"
        title="אנשי מקצוע"
        description="תוכן שיווקי בלבד — לא משפיע על תהליך הפרויקטים."
      >
        <VisibilityToggle
          id="professionals-visible"
          checked={professionals.isVisible}
          onChange={(isVisible) => setProfessionals({ ...professionals, isVisible })}
        />
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="professionals-eyebrow">
            <input
              id="professionals-eyebrow"
              className={formFieldStyles.input}
              value={professionals.eyebrow}
              onChange={(event) =>
                setProfessionals({ ...professionals, eyebrow: event.target.value })
              }
            />
          </FormField>
          <FormField label="כותרת" htmlFor="professionals-heading">
            <input
              id="professionals-heading"
              className={formFieldStyles.input}
              value={professionals.heading}
              onChange={(event) =>
                setProfessionals({ ...professionals, heading: event.target.value })
              }
            />
          </FormField>
        </div>
        <FormField label="טקסט" htmlFor="professionals-body">
          <textarea
            id="professionals-body"
            className={formFieldStyles.textarea}
            rows={4}
            value={professionals.body}
            onChange={(event) =>
              setProfessionals({ ...professionals, body: event.target.value })
            }
          />
        </FormField>
        <CmsImageField
          mediaScope={CMS_MEDIA_SCOPES.homepageProfessionals}
          label="תמונה"
          value={professionals.image}
          defaultAlt={professionals.heading}
          allowDecorative
          onChange={(image) =>
            setProfessionals({ ...professionals, image: normalizeFormImage(image) })
          }
        />

        {professionals.steps.map((step, index) => (
          <article key={step.id} className={styles.itemCard}>
            <div className={styles.itemCardHeader}>
              <h3 className={styles.itemCardTitle}>שלב {index + 1}</h3>
              <ArrayOrderButtons
                index={index}
                total={professionals.steps.length}
                itemLabel={`שלב ${index + 1}`}
                onMoveUp={() =>
                  setProfessionals({
                    ...professionals,
                    steps: moveArrayItemUp(professionals.steps, index),
                  })
                }
                onMoveDown={() =>
                  setProfessionals({
                    ...professionals,
                    steps: moveArrayItemDown(professionals.steps, index),
                  })
                }
              />
            </div>
            <div className={formStyles.fieldGrid}>
              <FormField label="מספר שלב" htmlFor={`step-number-${step.id}`}>
                <input
                  id={`step-number-${step.id}`}
                  className={formFieldStyles.input}
                  value={step.step}
                  onChange={(event) =>
                    setProfessionals({
                      ...professionals,
                      steps: professionals.steps.map((current, stepIndex) =>
                        stepIndex === index
                          ? { ...current, step: event.target.value }
                          : current,
                      ),
                    })
                  }
                />
              </FormField>
              <FormField label="כותרת" htmlFor={`step-title-${step.id}`}>
                <input
                  id={`step-title-${step.id}`}
                  className={formFieldStyles.input}
                  value={step.title}
                  onChange={(event) =>
                    setProfessionals({
                      ...professionals,
                      steps: professionals.steps.map((current, stepIndex) =>
                        stepIndex === index
                          ? { ...current, title: event.target.value }
                          : current,
                      ),
                    })
                  }
                />
              </FormField>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setProfessionals({
                  ...professionals,
                  steps: professionals.steps.filter((_, stepIndex) => stepIndex !== index),
                })
              }
            >
              הסרת שלב
            </Button>
          </article>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={professionals.steps.length >= CMS_LIMITS.professionalSteps}
          onClick={() =>
            setProfessionals({
              ...professionals,
              steps: [
                ...professionals.steps,
                createEmptyProfessionalStep(professionals.steps.length),
              ],
            })
          }
        >
          הוספת שלב
        </Button>

        <CtaFields
          prefix="primaryCta"
          value={professionals.primaryCta}
          onChange={(primaryCta) => setProfessionals({ ...professionals, primaryCta })}
          fieldErrors={professionalsSave.fieldErrors}
        />
        <CtaFields
          prefix="secondaryCta"
          value={professionals.secondaryCta}
          onChange={(secondaryCta) => setProfessionals({ ...professionals, secondaryCta })}
          fieldErrors={professionalsSave.fieldErrors}
        />
        <SaveSectionButton
          loading={professionalsSave.isPending}
          onClick={() =>
            professionalsSave.save(professionals, "סקשן אנשי המקצוע נשמר.")
          }
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-inspiration"
        title="השראה"
        description="פריטי השראה — ללא קישורים. ניתן להחליף או להסיר תוכן הדגמה."
      >
        <VisibilityToggle
          id="inspiration-visible"
          checked={inspiration.isVisible}
          onChange={(isVisible) => setInspiration({ ...inspiration, isVisible })}
        />
        <div className={formStyles.fieldGrid}>
          <FormField label="כותרת עליונה" htmlFor="inspiration-eyebrow">
            <input
              id="inspiration-eyebrow"
              className={formFieldStyles.input}
              value={inspiration.eyebrow}
              onChange={(event) =>
                setInspiration({ ...inspiration, eyebrow: event.target.value })
              }
            />
          </FormField>
          <FormField label="כותרת" htmlFor="inspiration-heading">
            <input
              id="inspiration-heading"
              className={formFieldStyles.input}
              value={inspiration.heading}
              onChange={(event) =>
                setInspiration({ ...inspiration, heading: event.target.value })
              }
            />
          </FormField>
        </div>
        <FormField label="טקסט תומך" htmlFor="inspiration-supporting">
          <textarea
            id="inspiration-supporting"
            className={formFieldStyles.textarea}
            rows={2}
            value={inspiration.supportingText ?? ""}
            onChange={(event) =>
              setInspiration({
                ...inspiration,
                supportingText: event.target.value || undefined,
              })
            }
          />
        </FormField>

        {inspiration.items.map((item, index) => {
          const imageDisabled = !documentExists && !persistedIdSet.has(item.id);

          return (
            <article key={item.id} className={styles.itemCard}>
              <div className={styles.itemCardHeader}>
                <h3 className={styles.itemCardTitle}>פריט {index + 1}</h3>
                <ArrayOrderButtons
                  index={index}
                  total={inspiration.items.length}
                  itemLabel={`פריט ${index + 1}`}
                  onMoveUp={() =>
                    setInspiration({
                      ...inspiration,
                      items: moveArrayItemUp(inspiration.items, index),
                    })
                  }
                  onMoveDown={() =>
                    setInspiration({
                      ...inspiration,
                      items: moveArrayItemDown(inspiration.items, index),
                    })
                  }
                />
              </div>
              <div className={formStyles.fieldGrid}>
                <FormField label="כותרת" htmlFor={`inspiration-title-${item.id}`}>
                  <input
                    id={`inspiration-title-${item.id}`}
                    className={formFieldStyles.input}
                    value={item.title}
                    onChange={(event) =>
                      setInspiration({
                        ...inspiration,
                        items: inspiration.items.map((current, itemIndex) =>
                          itemIndex === index
                            ? { ...current, title: event.target.value }
                            : current,
                        ),
                      })
                    }
                  />
                </FormField>
                <FormField label="כותרת משנה" htmlFor={`inspiration-subtitle-${item.id}`}>
                  <input
                    id={`inspiration-subtitle-${item.id}`}
                    className={formFieldStyles.input}
                    value={item.subtitle}
                    onChange={(event) =>
                      setInspiration({
                        ...inspiration,
                        items: inspiration.items.map((current, itemIndex) =>
                          itemIndex === index
                            ? { ...current, subtitle: event.target.value }
                            : current,
                        ),
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="פריסה" htmlFor={`inspiration-layout-${item.id}`}>
                <select
                  id={`inspiration-layout-${item.id}`}
                  className={formFieldStyles.select}
                  value={item.layout}
                  onChange={(event) =>
                    setInspiration({
                      ...inspiration,
                      items: inspiration.items.map((current, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...current,
                              layout: event.target.value as HomepageInspirationFormInput["items"][number]["layout"],
                            }
                          : current,
                      ),
                    })
                  }
                >
                  <option value="featured">מודגש</option>
                  <option value="standard">רגיל</option>
                </select>
              </FormField>
              <VisibilityToggle
                id={`inspiration-visible-${item.id}`}
                checked={item.isVisible}
                onChange={(isVisible) =>
                  setInspiration({
                    ...inspiration,
                    items: inspiration.items.map((current, itemIndex) =>
                      itemIndex === index ? { ...current, isVisible } : current,
                    ),
                  })
                }
                label="הצגת פריט"
              />
              <CmsImageField
                mediaScope={CMS_MEDIA_SCOPES.homepageInspiration}
                label="תמונה"
                value={item.image}
                defaultAlt={item.title}
                itemId={item.id}
                disabled={imageDisabled}
                disabledHelpText="שמרו את הסקשן לפני העלאת תמונה."
                onChange={(image) =>
                  setInspiration({
                    ...inspiration,
                    items: inspiration.items.map((current, itemIndex) =>
                      itemIndex === index
                        ? { ...current, image: normalizeFormImage(image) }
                        : current,
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setInspiration({
                    ...inspiration,
                    items: inspiration.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              >
                הסרת פריט
              </Button>
            </article>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={inspiration.items.length >= CMS_LIMITS.inspirationItems}
          onClick={() =>
            setInspiration({
              ...inspiration,
              items: [...inspiration.items, createEmptyInspirationItem(inspiration.items.length)],
            })
          }
        >
          הוספת פריט
        </Button>

        <SaveSectionButton
          loading={inspirationSave.isPending}
          onClick={() => inspirationSave.save(inspiration, "סקשן ההשראה נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-closing"
        title="סיום"
        description="סקשן סיום עם קריאות לפעולה. פרטי קשר ב"
      >
        <p className={styles.helperText}>
          <AdminInlineLink href="/admin/content/site">עריכת פרטי קשר</AdminInlineLink>
        </p>
        <VisibilityToggle
          id="closing-visible"
          checked={closing.isVisible}
          onChange={(isVisible) => setClosing({ ...closing, isVisible })}
        />
        <FormField label="כותרת" htmlFor="closing-heading">
          <input
            id="closing-heading"
            className={formFieldStyles.input}
            value={closing.heading}
            onChange={(event) => setClosing({ ...closing, heading: event.target.value })}
          />
        </FormField>
        <FormField label="טקסט תומך" htmlFor="closing-supporting">
          <textarea
            id="closing-supporting"
            className={formFieldStyles.textarea}
            rows={3}
            value={closing.supportingText}
            onChange={(event) =>
              setClosing({ ...closing, supportingText: event.target.value })
            }
          />
        </FormField>
        <FormField label="הערת קשר (אופציונלי)" htmlFor="closing-contact-note">
          <input
            id="closing-contact-note"
            className={formFieldStyles.input}
            value={closing.contactNote ?? ""}
            onChange={(event) =>
              setClosing({
                ...closing,
                contactNote: event.target.value || undefined,
              })
            }
          />
        </FormField>
        <CtaFields
          prefix="primaryCta"
          value={closing.primaryCta}
          onChange={(primaryCta) => setClosing({ ...closing, primaryCta })}
          fieldErrors={closingSave.fieldErrors}
        />
        <CtaFields
          prefix="secondaryCta"
          value={closing.secondaryCta}
          onChange={(secondaryCta) => setClosing({ ...closing, secondaryCta })}
          fieldErrors={closingSave.fieldErrors}
        />
        <SaveSectionButton
          loading={closingSave.isPending}
          onClick={() => closingSave.save(closing, "סקשן הסיום נשמר.")}
        />
      </HomepageSectionShell>

      <HomepageSectionShell
        id="homepage-section-order"
        title="סדר הסקשנים"
        description="Hero תמיד ראשון. שינוי הסדר ישפיע בדף הציבורי לאחר Demo 16D."
      >
        <ul className={styles.sectionOrderList}>
          {sectionOrder.map((key, index) => (
            <li key={key} className={styles.sectionOrderItem}>
              <span className={styles.sectionOrderLabel}>
                {HOMEPAGE_SECTION_LABELS[key]}
              </span>
              <ArrayOrderButtons
                index={index}
                total={sectionOrder.length}
                itemLabel={HOMEPAGE_SECTION_LABELS[key]}
                onMoveUp={() => {
                  if (index <= 1) {
                    return;
                  }
                  setSectionOrder(moveSectionOrderUp(sectionOrder, index));
                }}
                onMoveDown={() => {
                  if (index === 0) {
                    return;
                  }
                  setSectionOrder(moveSectionOrderDown(sectionOrder, index));
                }}
              />
            </li>
          ))}
        </ul>
        <SaveSectionButton
          label="שמירת סדר"
          loading={sectionOrderSave.isPending}
          onClick={() => sectionOrderSave.save(sectionOrder, "סדר הסקשנים נשמר.")}
        />
      </HomepageSectionShell>
    </div>
  );
}
