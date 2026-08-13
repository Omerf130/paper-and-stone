const UNSAFE_HREF_PATTERNS = [
  /^\/\//,
  /^https?:\/\//i,
  /javascript:/i,
  /data:/i,
] as const;

export function isSafeInternalCtaHref(href: string): boolean {
  const trimmed = href.trim();

  if (!trimmed.startsWith("/")) {
    return false;
  }

  return !UNSAFE_HREF_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export const CMS_CTA_ERRORS = {
  UNSAFE_HREF:
    "קישור חייב להיות נתיב פנימי שמתחיל ב-/ ואינו מכיל כתובות חיצוניות או פרוטוקולים לא בטוחים.",
  REQUIRED_LABEL: "נא להזין תווית לכפתור.",
  REQUIRED_HREF: "נא להזין קישור.",
} as const;
