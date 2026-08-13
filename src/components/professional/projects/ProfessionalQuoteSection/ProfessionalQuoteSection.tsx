"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  acceptProjectQuoteAction,
  requestProjectQuoteChangeAction,
} from "@/app/professional/projects/quote-actions";
import QuoteTotalsSummary from "@/components/quotes/QuoteTotalsSummary/QuoteTotalsSummary";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type {
  ProfessionalQuoteDisplayView,
  ProfessionalQuoteHistoryItemView,
  ProfessionalQuoteSectionView,
  QuoteActionState,
} from "@/types/project-quote";
import styles from "./ProfessionalQuoteSection.module.scss";

type ProfessionalQuoteSectionProps = {
  section: ProfessionalQuoteSectionView;
};

const initialActionState: QuoteActionState = {};

function mapStatusTone(
  status: ProfessionalQuoteDisplayView["status"],
): "neutral" | "info" | "positive" | "warning" {
  switch (status) {
    case "accepted":
      return "positive";
    case "change_requested":
      return "warning";
    case "sent":
      return "info";
    default:
      return "neutral";
  }
}

export default function ProfessionalQuoteSection({
  section,
}: ProfessionalQuoteSectionProps) {
  const quote = section.currentQuote;

  if (!quote && section.previousQuotes.length === 0) {
    return (
      <p className={styles.empty}>
        הצעת מחיר תופיע כאן לאחר שהאדמין ישלח תמחור לפרויקט.
      </p>
    );
  }

  return (
    <div className={styles.section}>
      {section.actionHint ? (
        <FeedbackBanner tone="info">{section.actionHint}</FeedbackBanner>
      ) : null}

      {quote ? <ActiveQuote quote={quote} /> : null}

      {section.previousQuotes.length > 0 ? (
        <QuoteHistory quotes={section.previousQuotes} />
      ) : null}
    </div>
  );
}

function ActiveQuote({ quote }: { quote: ProfessionalQuoteDisplayView }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialActionState);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "accept" | "change" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const runAccept = () => {
    setFormState(initialActionState);
    setPendingAction("accept");
    startTransition(async () => {
      const result = await acceptProjectQuoteAction(quote.id);
      setPendingAction(null);
      setFormState(result);
      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmAccept(false);
        return;
      }
      toast({ type: "success", message: "הצעת המחיר אושרה" });
      setConfirmAccept(false);
      router.refresh();
    });
  };

  const runRequestChange = () => {
    setFormState(initialActionState);
    setPendingAction("change");
    startTransition(async () => {
      const result = await requestProjectQuoteChangeAction({
        quoteId: quote.id,
        message: changeMessage,
      });
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors || result.error) {
        if (result.error) {
          toast({ type: "error", message: result.error });
        }
        return;
      }
      toast({ type: "success", message: "בקשת השינוי נשלחה" });
      setShowChangeForm(false);
      setChangeMessage("");
      router.refresh();
    });
  };

  return (
    <article className={styles.quoteCard}>
      <div className={styles.quoteHeader}>
        <StatusBadge tone={mapStatusTone(quote.status)}>
          {`גרסה ${quote.version} · ${quote.statusLabel}`}
        </StatusBadge>
        {quote.sentAt ? (
          <span className={styles.meta}>
            נשלח{" "}
            <time dateTime={quote.sentAt}>{formatDateTime(quote.sentAt)}</time>
          </span>
        ) : null}
        {quote.validUntil ? (
          <span className={styles.meta}>
            תוקף לתצוגה:{" "}
            <time dateTime={quote.validUntil}>
              {formatDateTime(quote.validUntil)}
            </time>
          </span>
        ) : null}
      </div>

      <ul className={styles.lineList}>
        {quote.itemLines.map((line) => (
          <li key={line.projectItemId} className={styles.lineItem}>
            <div>
              <p className={styles.productName}>{line.productNameSnapshot}</p>
              <p className={styles.configuration}>{line.configurationSummary}</p>
              <p className={styles.quantity}>כמות: {line.quantity}</p>
              {line.adminNote ? (
                <p className={styles.note}>הערה: {line.adminNote}</p>
              ) : null}
            </div>
            <div className={styles.pricing}>
              <p>{`${line.unitPriceFormatted} ליחידה`}</p>
              <p className={styles.lineTotal}>{line.lineTotalFormatted}</p>
            </div>
          </li>
        ))}
      </ul>

      {quote.additionalLines.length > 0 ? (
        <ul className={styles.additionalList}>
          {quote.additionalLines.map((line) => (
            <li key={line.label} className={styles.additionalItem}>
              <span>{line.label}</span>
              <span>{line.amountFormatted}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {quote.generalNote ? (
        <p className={styles.generalNote}>{quote.generalNote}</p>
      ) : null}

      <QuoteTotalsSummary totals={quote.totals} idPrefix={`pro-quote-${quote.id}`} />

      {formState.error ? (
        <p className={styles.error} role="alert">
          {formState.error}
        </p>
      ) : null}

      {quote.canAccept || quote.canRequestChange ? (
        <div className={styles.actions}>
          {quote.canAccept ? (
            <Button onClick={() => setConfirmAccept(true)} disabled={isPending}>
              אישור הצעת מחיר
            </Button>
          ) : null}
          {quote.canRequestChange ? (
            <Button
              variant="secondary"
              onClick={() => setShowChangeForm((current) => !current)}
              disabled={isPending}
            >
              בקשת שינוי
            </Button>
          ) : null}
        </div>
      ) : null}

      {showChangeForm ? (
        <div className={styles.changeForm}>
          <FormField
            label="הסבר לבקשת שינוי (חובה)"
            htmlFor="quote-change-message"
            error={formState.fieldErrors?.message}
          >
            <textarea
              id="quote-change-message"
              className={formFieldStyles.textarea}
              rows={4}
              value={changeMessage}
              onChange={(event) => setChangeMessage(event.target.value)}
              disabled={isPending}
              required
            />
          </FormField>
          <Button
            variant="secondary"
            onClick={runRequestChange}
            loading={pendingAction === "change"}
            loadingLabel="שולח..."
            disabled={isPending}
          >
            שליחת בקשת שינוי
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmAccept}
        title="אישור הצעת מחיר"
        description="לאשר את הצעת המחיר? לאחר האישור הפרויקט ימתין לאישור סופי של האדמין."
        confirmLabel="אישור הצעה"
        loading={pendingAction === "accept"}
        onConfirm={runAccept}
        onCancel={() => setConfirmAccept(false)}
      />
    </article>
  );
}

function QuoteHistory({
  quotes,
}: {
  quotes: ProfessionalQuoteHistoryItemView[];
}) {
  return (
    <details className={styles.history}>
      <summary className={styles.historySummary}>הצעות קודמות</summary>
      <ul className={styles.historyList}>
        {quotes.map((quote) => (
          <li key={quote.id} className={styles.historyItem}>
            <span>{`גרסה ${quote.version}`}</span>
            <span>{quote.statusLabel}</span>
            <span>{quote.totalFormatted}</span>
            {quote.sentAt ? (
              <time dateTime={quote.sentAt}>{formatDateTime(quote.sentAt)}</time>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
