import type { Metadata } from "next";
import SiteUnavailable from "@/components/SiteUnavailable/SiteUnavailable";
import { SITE_UNAVAILABLE } from "@/config/site-unavailable";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "Paper & Stone",
  description: "פלטפורמת ריהוט וחומרים לפרויקטים",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl">
      <body>{SITE_UNAVAILABLE ? <SiteUnavailable /> : children}</body>
    </html>
  );
}
