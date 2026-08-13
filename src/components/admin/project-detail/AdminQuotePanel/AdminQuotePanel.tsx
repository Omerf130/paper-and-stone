"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  saveQuoteDraftAction,
  sendProjectQuoteAction,
} from "@/app/admin/projects/quote-actions";
import QuoteTotalsSummary from "@/components/quotes/QuoteTotalsSummary/QuoteTotalsSummary";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { calculateQuoteAmounts, mapCalculationToTotalsView } from "@/lib/quotes/quote-calculations";
import { parseShekelsInputToAgorot } from "@/lib/money/parse-money-input";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type {
  AdminQuoteDisplayView,
  AdminQuoteFormView,
  AdminQuoteHistoryItemView,
  AdminQuotePanelView,
  QuoteActionState,
} from "@/types/project-quote";
import styles from "./AdminQuotePanel.module.scss";

type AdminQuotePanelProps = {
  panel: AdminQuotePanelView;
};

type FormLine = AdminQuoteFormView["itemLines"][number];
type AdditionalLine = AdminQuoteFormView["additionalLines"][number];

const initialActionState: QuoteActionState = {};

function mapQuoteStatusTone(
  status: AdminQuoteDisplayView["status"],
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

export default function AdminQuotePanel({ panel }: AdminQuotePanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialActionState);
  const [confirmSend, setConfirmSend] = useState(false);
  const [pendingAction, setPendingAction] = useState<"draft" | "send" | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const initialForm = panel.draft ?? {
    quoteId: "",
    itemLines: [],
    additionalLines: [],
    totals: mapCalculationToTotalsView(
      calculateQuoteAmounts({ itemLines: [], additionalLines: [] }),
    ),
  };

  const [itemLines, setItemLines] = useState<FormLine[]>(initialForm.itemLines);
  const [additionalLines, setAdditionalLines] = useState<AdditionalLine[]>(
    initialForm.additionalLines,
  );
  const [generalNote, setGeneralNote] = useState(initialForm.generalNote ?? "");
  const [validUntil, setValidUntil] = useState(initialForm.validUntil ?? "");

  const previewTotals = useMemo(() => {
    const parsedItemLines = itemLines.map((line) => ({
      quantity: line.quantity,
      unitPriceAgorot: parseShekelsInputToAgorot(line.unitPriceShekels) ?? 0,
    }));
    const parsedAdditionalLines = additionalLines.map((line) => ({
      amountAgorot: parseShekelsInputToAgorot(line.amountShekels) ?? 0,
    }));

    return mapCalculationToTotalsView(
      calculateQuoteAmounts({
        itemLines: parsedItemLines,
        additionalLines: parsedAdditionalLines,
      }),
    );
  }, [itemLines, additionalLines]);

  if (!panel.canManage) {
    return (
      <p className={styles.unavailable}>
        {panel.unavailableReason ?? "תמחור אינו זמין לפרויקט זה."}
      </p>
    );
  }

  const buildPayload = () => ({
    projectId: panel.projectId,
    itemLines: itemLines.map((line) => ({
      projectItemId: line.projectItemId,
      unitPriceShekels: line.unitPriceShekels,
      adminNote: line.adminNote,
    })),
    additionalLines,
    generalNote,
    validUntil,
  });

  const runSaveDraft = () => {
    setFormState(initialActionState);
    setPendingAction("draft");
    startTransition(async () => {
      const result = await saveQuoteDraftAction(buildPayload());
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors || result.error) {
        if (result.error) {
          toast({ type: "error", message: result.error });
        }
        return;
      }
      toast({ type: "success", message: "טיוטת הצעת המחיר נשמרה" });
      router.refresh();
    });
  };

  const runSendQuote = () => {
    setFormState(initialActionState);
    setPendingAction("send");
    startTransition(async () => {
      const result = await sendProjectQuoteAction(buildPayload());
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors || result.error) {
        if (result.error) {
          toast({ type: "error", message: result.error });
        }
        setConfirmSend(false);
        return;
      }
      toast({ type: "success", message: "הצעת המחיר נשלחה לאיש המקצוע" });
      setConfirmSend(false);
      router.refresh();
    });
  };

  const updateItemLine = (
    projectItemId: string,
    patch: Partial<FormLine>,
  ) => {
    setItemLines((current) =>
      current.map((line) =>
        line.projectItemId === projectItemId ? { ...line, ...patch } : line,
      ),
    );
  };

  const updateAdditionalLine = (
    index: number,
    patch: Partial<AdditionalLine>,
  ) => {
    setAdditionalLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  };

  const addAdditionalLine = () => {
    setAdditionalLines((current) => [
      ...current,
      { label: "", amountShekels: "" },
    ]);
  };

  const removeAdditionalLine = (index: number) => {
    setAdditionalLines((current) =>
      current.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  return (
    <div className={styles.panel}>
      {panel.approvalBlockedReason ? (
        <FeedbackBanner tone="warning">{panel.approvalBlockedReason}</FeedbackBanner>
      ) : null}

      {panel.currentQuote ? (
        <CurrentQuoteSummary quote={panel.currentQuote} />
      ) : null}

      {formState.error ? (
        <p className={styles.error} role="alert">
          {formState.error}
        </p>
      ) : null}

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>תמחור מוצרים</h3>
        <ul className={styles.itemList}>
          {itemLines.map((line) => (
            <li key={line.projectItemId} className={styles.itemRow}>
              <div className={styles.itemIdentity}>
                <p className={styles.productName}>{line.productNameSnapshot}</p>
                <p className={styles.configuration}>{line.configurationSummary}</p>
                <p className={styles.quantity}>כמות: {line.quantity}</p>
              </div>
              <div className={styles.itemPricing}>
                <FormField
                  label="מחיר ליחידה (₪, לפני מע״מ)"
                  htmlFor={`unit-price-${line.projectItemId}`}
                  error={
                    formState.fieldErrors?.[
                      `itemLines.${itemLines.indexOf(line)}.unitPriceShekels`
                    ]
                  }
                >
                  <input
                    id={`unit-price-${line.projectItemId}`}
                    className={formFieldStyles.input}
                    inputMode="decimal"
                    dir="ltr"
                    value={line.unitPriceShekels}
                    onChange={(event) =>
                      updateItemLine(line.projectItemId, {
                        unitPriceShekels: event.target.value,
                      })
                    }
                    disabled={isPending}
                  />
                </FormField>
                <FormField
                  label="הערת אדמין (אופציונלי)"
                  htmlFor={`item-note-${line.projectItemId}`}
                >
                  <input
                    id={`item-note-${line.projectItemId}`}
                    className={formFieldStyles.input}
                    value={line.adminNote ?? ""}
                    onChange={(event) =>
                      updateItemLine(line.projectItemId, {
                        adminNote: event.target.value,
                      })
                    }
                    disabled={isPending}
                  />
                </FormField>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>שורות נוספות</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={addAdditionalLine}
            disabled={isPending}
          >
            הוספת שורה
          </Button>
        </div>
        {additionalLines.length === 0 ? (
          <p className={styles.helper}>
            ניתן להוסיף הובלה, הרכבה או הנחה (סכום שלילי).
          </p>
        ) : (
          <ul className={styles.additionalList}>
            {additionalLines.map((line, index) => (
              <li key={`additional-${index}`} className={styles.additionalRow}>
                <FormField
                  label="תיאור"
                  htmlFor={`additional-label-${index}`}
                  error={formState.fieldErrors?.[`additionalLines.${index}.label`]}
                >
                  <input
                    id={`additional-label-${index}`}
                    className={formFieldStyles.input}
                    value={line.label}
                    onChange={(event) =>
                      updateAdditionalLine(index, { label: event.target.value })
                    }
                    disabled={isPending}
                  />
                </FormField>
                <FormField
                  label="סכום (₪)"
                  htmlFor={`additional-amount-${index}`}
                  error={
                    formState.fieldErrors?.[`additionalLines.${index}.amountShekels`]
                  }
                >
                  <input
                    id={`additional-amount-${index}`}
                    className={formFieldStyles.input}
                    inputMode="decimal"
                    dir="ltr"
                    value={line.amountShekels}
                    onChange={(event) =>
                      updateAdditionalLine(index, {
                        amountShekels: event.target.value,
                      })
                    }
                    disabled={isPending}
                  />
                </FormField>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdditionalLine(index)}
                  disabled={isPending}
                >
                  הסרה
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FormField
        label="הערה כללית (אופציונלי)"
        htmlFor="quote-general-note"
        error={formState.fieldErrors?.generalNote}
      >
        <textarea
          id="quote-general-note"
          className={formFieldStyles.textarea}
          rows={3}
          value={generalNote}
          onChange={(event) => setGeneralNote(event.target.value)}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="תוקף הצעה (אופציונלי, לתצוגה בלבד)"
        htmlFor="quote-valid-until"
        error={formState.fieldErrors?.validUntil}
      >
        <input
          id="quote-valid-until"
          className={formFieldStyles.input}
          type="date"
          value={validUntil}
          onChange={(event) => setValidUntil(event.target.value)}
          disabled={isPending}
        />
      </FormField>

      <QuoteTotalsSummary totals={previewTotals} idPrefix="admin-quote-preview" />

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={runSaveDraft}
          loading={pendingAction === "draft"}
          loadingLabel="שומר..."
          disabled={isPending}
        >
          שמירת טיוטה
        </Button>
        <Button
          onClick={() => setConfirmSend(true)}
          loading={pendingAction === "send"}
          loadingLabel="שולח..."
          disabled={isPending}
        >
          שליחת הצעת מחיר
        </Button>
      </div>

      {panel.previousQuotes.length > 0 ? (
        <QuoteHistoryList quotes={panel.previousQuotes} />
      ) : null}

      <ConfirmDialog
        open={confirmSend}
        title="שליחת הצעת מחיר"
        description="לשלוח את הצעת המחיר לאיש המקצוע? לאחר השליחה לא ניתן לערוך את הגרסה."
        confirmLabel="שליחה"
        loading={pendingAction === "send"}
        onConfirm={runSendQuote}
        onCancel={() => setConfirmSend(false)}
      />
    </div>
  );
}

function CurrentQuoteSummary({ quote }: { quote: AdminQuoteDisplayView }) {
  return (
    <div className={styles.currentQuote}>
      <div className={styles.currentQuoteHeader}>
        <StatusBadge tone={mapQuoteStatusTone(quote.status)}>
          {`גרסה ${quote.version} · ${quote.statusLabel}`}
        </StatusBadge>
        {quote.sentAt ? (
          <span className={styles.meta}>
            נשלח{" "}
            <time dateTime={quote.sentAt}>{formatDateTime(quote.sentAt)}</time>
          </span>
        ) : null}
      </div>
      {quote.changeRequestMessage ? (
        <FeedbackBanner tone="warning">
          <strong>בקשת שינוי מאיש המקצוע:</strong> {quote.changeRequestMessage}
        </FeedbackBanner>
      ) : null}
      <QuoteTotalsSummary totals={quote.totals} idPrefix={`quote-${quote.id}`} />
    </div>
  );
}

function QuoteHistoryList({ quotes }: { quotes: AdminQuoteHistoryItemView[] }) {
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
