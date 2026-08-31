import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import ProjectPayment, { type IProjectPayment } from "@/models/ProjectPayment";
import User from "@/models/User";
import { calculateProjectPaymentSummary } from "@/lib/projects/project-payment-totals";
import { calculatePaymentReadyPricingTotals } from "@/lib/pricing/pricing-totals";
import { getItemPricingStatus } from "@/lib/pricing/pricing-commercial-model";
import type { IProjectItem } from "@/models/Project";
import {
  PROJECT_PAYMENT_METHOD_LABELS,
  type AdminProjectPaymentSummaryView,
  type AdminProjectPaymentView,
} from "@/types/project-payment";

async function resolveAdminUserLabels(
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const users = await User.find({
    _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("fullName email")
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      user.fullName?.trim() || user.email,
    ]),
  );
}

function mapPaymentToView(
  payment: IProjectPayment,
  adminLabels: Map<string, string>,
): AdminProjectPaymentView {
  const createdByAdminUserId = payment.createdByAdminUserId.toString();

  return {
    id: payment._id.toString(),
    projectId: payment.projectId.toString(),
    amountAgorot: payment.amountAgorot,
    amountFormatted: formatIlsAgorot(payment.amountAgorot),
    paymentDate: payment.paymentDate.toISOString(),
    paymentMethod: payment.paymentMethod,
    paymentMethodLabel: PROJECT_PAYMENT_METHOD_LABELS[payment.paymentMethod],
    note: payment.note,
    createdByAdminUserId,
    createdByAdminLabel: adminLabels.get(createdByAdminUserId),
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export async function getProjectPaymentsForAdminView(
  projectId: string,
): Promise<AdminProjectPaymentView[]> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return [];
  }

  const payments = await ProjectPayment.find({
    projectId: new Types.ObjectId(projectId),
  })
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean<IProjectPayment[]>();

  const adminUserIds = payments.map((payment) =>
    payment.createdByAdminUserId.toString(),
  );
  const adminLabels = await resolveAdminUserLabels(adminUserIds);

  return payments.map((payment) => mapPaymentToView(payment, adminLabels));
}

export async function getProjectPaymentSummaryForAdminView(
  projectId: string,
  items: IProjectItem[],
): Promise<AdminProjectPaymentSummaryView> {
  const payments = await getProjectPaymentsForAdminView(projectId);
  const pricingTotals = calculatePaymentReadyPricingTotals(items);
  const needsReviewItemCount = items.filter(
    (item) => getItemPricingStatus(item.pricing) === "needs_review",
  ).length;
  const unpricedItemCount = items.filter(
    (item) => getItemPricingStatus(item.pricing) === "unpriced",
  ).length;
  const commercialTotalIncomplete =
    needsReviewItemCount > 0 || unpricedItemCount > 0;

  const summary = calculateProjectPaymentSummary({
    projectTotalInclVatAgorot: commercialTotalIncomplete
      ? undefined
      : pricingTotals.clientTotalInclVatAgorot,
    payments,
  });

  if (!commercialTotalIncomplete) {
    return summary;
  }

  const messageParts: string[] = [];
  if (needsReviewItemCount > 0) {
    messageParts.push(
      `${needsReviewItemCount} פריטים ממתינים לבדיקת תמחור`,
    );
  }
  if (unpricedItemCount > 0) {
    messageParts.push(`${unpricedItemCount} פריטים ללא תמחור`);
  }

  return {
    ...summary,
    commercialTotalIncomplete: true,
    commercialTotalIncompleteMessage: `סה״כ התשלום אינו שלם — ${messageParts.join(" · ")}.`,
  };
}

export function countLogisticsInProgressItems(
  items: Array<{ logistics?: { status?: string } | null }>,
): number {
  return items.filter((item) => {
    const status = item.logistics?.status ?? "not_ordered";
    return status !== "delivered";
  }).length;
}
