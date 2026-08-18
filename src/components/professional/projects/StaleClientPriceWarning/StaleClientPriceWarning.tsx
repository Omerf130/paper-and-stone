import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";

const STALE_ARCHITECT_PRICE_MESSAGE =
  "מחיר האדריכל השתנה. יש לבדוק מחדש את מחיר הלקוח.";

export default function StaleClientPriceWarning() {
  return (
    <FeedbackBanner tone="warning">{STALE_ARCHITECT_PRICE_MESSAGE}</FeedbackBanner>
  );
}
