import {
  categories,
  projects,
  workflowSteps,
} from "@/components/home/homepage-data";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import {
  HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS,
  HOMEPAGE_DEFAULT_INSPIRATION_ITEM_IDS,
  HOMEPAGE_DEFAULT_PROFESSIONAL_STEP_IDS,
} from "@/lib/cms/cms-default-item-ids";
import {
  CMS_SINGLETON_KEYS,
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  type CatalogPageContentView,
  type HomepageContentView,
  type SiteSettingsView,
} from "@/types/cms-content";

export const DEFAULT_SITE_SETTINGS: SiteSettingsView = {
  key: CMS_SINGLETON_KEYS.site,
  schemaVersion: CMS_SCHEMA_VERSION,
  brandName: "Paper & Stone",
  footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
  copyrightCompanyName: "Paper & Stone",
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentView = {
  key: CMS_SINGLETON_KEYS.homepage,
  schemaVersion: CMS_SCHEMA_VERSION,
  sectionOrder: [...DEFAULT_HOMEPAGE_SECTION_ORDER],
  hero: {
    eyebrow: "Paper & Stone",
    heading: "ריהוט וחומרים שמתחילים ברעיון ונכנסים לפרויקט",
    supportingText:
      "קטלוג ריהוט, חומרים וגמרים לאדריכלים, מעצבים ולקוחות שמחפשים פתרון מדויק לפרויקט.",
    primaryCta: {
      label: "לגלות את הקולקציה",
      href: "/products",
      isVisible: true,
    },
    secondaryCta: {
      label: "לאדריכלים ומעצבים",
      href: "/register",
      isVisible: true,
    },
    image: {
      url: "/images/hero-storefront.jpg",
      storageKey: "static/homepage/hero-storefront.jpg",
      alt: "חזית החנות Paper & Stone",
      isDecorative: true,
      width: 1024,
      height: 431,
    },
    isVisible: true,
  },
  categories: {
    eyebrow: "קטגוריות",
    heading: "ריהוט, חומרים וגמרים",
    supportingText:
      "מאורגנים לפי סוג ושימוש בפרויקט — תצוגה עריכתית לקראת הרחבת הקטלוג.",
    items: categories.map((category, index) => ({
      id: HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS[
        category.id as keyof typeof HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS
      ],
      displayTitle: category.name,
      layout: category.layout,
      isVisible: true,
      order: index,
    })),
    isVisible: true,
  },
  featuredProducts: {
    eyebrow: "נבחרים",
    heading: "מוצרים נבחרים",
    cta: {
      label: "כל המוצרים",
      href: "/products",
      isVisible: true,
    },
    isVisible: true,
  },
  about: {
    eyebrow: "Paper & Stone",
    heading: "ריהוט, חומרים ופתרונות לפרויקטים מדויקים",
    body: "Paper & Stone מייבאת ומשווקת ריהוט, חומרים ופתרונות עיצוב לפרויקטים פרטיים ומקצועיים.\n\nאנחנו עובדים עם אדריכלים, מעצבי פנים ולקוחות פרטיים שמחפשים איכות, דיוק וגישה מקצועית — מהבחירה הראשונה ועד הכניסה לפרויקט.",
    isVisible: true,
  },
  professionals: {
    eyebrow: "לאדריכלים ומעצבים",
    heading: "כל הפרויקט. במקום אחד.",
    body: "פלטפורמה מקצועית לניהול פרויקטים — מארגון חדרים ומוצרים ועד שליחה לתמחור ומעקב.",
    steps: workflowSteps.map((step, index) => ({
      id: HOMEPAGE_DEFAULT_PROFESSIONAL_STEP_IDS[
        step.step as keyof typeof HOMEPAGE_DEFAULT_PROFESSIONAL_STEP_IDS
      ],
      step: step.step,
      title: step.title,
      order: index,
    })),
    primaryCta: {
      label: "פתיחת חשבון מקצועי",
      href: "/register",
      isVisible: true,
    },
    secondaryCta: {
      label: "התחברות",
      href: "/login",
      isVisible: true,
    },
    isVisible: true,
  },
  inspiration: {
    eyebrow: "פרויקטים והשראה",
    heading: "מבט לפרויקטים",
    supportingText: "תוכן המחצה — יש להחליף לפני השקה.",
    items: projects.map((project, index) => ({
      id: HOMEPAGE_DEFAULT_INSPIRATION_ITEM_IDS[
        project.id as keyof typeof HOMEPAGE_DEFAULT_INSPIRATION_ITEM_IDS
      ],
      title: project.title,
      subtitle: project.subtitle,
      layout: project.layout,
      isVisible: true,
      order: index,
    })),
    isVisible: true,
    isContentManaged: false,
  },
  closing: {
    heading: "מתחילים פרויקט?",
    supportingText:
      "גלו את הקולקציה, או פתחו חשבון מקצועי כדי לנהל פרויקט מול Paper & Stone.",
    contactNote: "פרטי יצירת קשר יפורסמו בהמשך.",
    primaryCta: {
      label: "לגלות את הקולקציה",
      href: "/products",
      isVisible: true,
    },
    secondaryCta: {
      label: "לאדריכלים ומעצבים",
      href: "/register",
      isVisible: true,
    },
    isVisible: true,
  },
};

export const DEFAULT_CATALOG_PAGE_CONTENT: CatalogPageContentView = {
  key: CMS_SINGLETON_KEYS.catalog,
  schemaVersion: CMS_SCHEMA_VERSION,
  eyebrow: "Paper & Stone",
  heading: "מוצרים",
  supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
};

export function getDefaultHomepageContentSnapshot(): HomepageContentView {
  return structuredClone(DEFAULT_HOMEPAGE_CONTENT);
}
