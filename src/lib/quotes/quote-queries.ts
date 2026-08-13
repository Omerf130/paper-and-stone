import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ProjectQuote from "@/models/ProjectQuote";
import type { IProjectQuote } from "@/models/ProjectQuote";
import {
  mapQuoteToAdminDisplayView,
  mapQuoteToAdminFormView,
  mapQuoteToAdminHistoryItemView,
  mapQuoteToProfessionalDisplayView,
  mapQuoteToProfessionalHistoryItemView,
} from "@/lib/quotes/mapQuoteToView";
import {
  getAdminQuoteApprovalBlockedReason,
  getProfessionalQuoteActionHint,
  getProjectQuoteStatusLabel,
} from "@/lib/quotes/quote-display-helpers";
import { buildQuoteItemLinesFromProject } from "@/lib/quotes/buildQuoteItemLinesFromProject";
import {
  calculateQuoteAmounts,
  mapCalculationToTotalsView,
} from "@/lib/quotes/quote-calculations";
import type {
  AdminProjectQuoteStatusSummary,
  AdminQuoteAttentionSummary,
  AdminQuotePanelView,
  ProfessionalQuoteSectionView,
} from "@/types/project-quote";

const PROFESSIONAL_VISIBLE_STATUSES = [
  "sent",
  "change_requested",
  "accepted",
  "superseded",
] as const;

function getCurrentQuoteForRevision(
  quotes: IProjectQuote[],
  submissionRevision: number,
): IProjectQuote | null {
  const revisionQuotes = quotes.filter(
    (quote) =>
      quote.submissionRevision === submissionRevision &&
      quote.status !== "draft",
  );

  if (revisionQuotes.length === 0) {
    return null;
  }

  return revisionQuotes.sort((a, b) => b.version - a.version)[0] ?? null;
}

function getPreviousQuotes(quotes: IProjectQuote[], currentQuoteId?: string) {
  return quotes
    .filter(
      (quote) =>
        quote.status !== "draft" &&
        quote._id.toString() !== currentQuoteId &&
        quote.sentAt,
    )
    .sort((a, b) => b.version - a.version);
}

export async function getAdminQuotePanelView(
  projectId: string,
): Promise<AdminQuotePanelView | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  const project = await Project.findById(projectId).lean();

  if (!project) {
    return null;
  }

  const submissionRevision = project.submissionRevision ?? 0;
  const quotes = (await ProjectQuote.find({ projectId: project._id })
    .sort({ version: -1 })
    .lean()) as IProjectQuote[];

  const quoteEverSent = quotes.some((quote) => Boolean(quote.sentAt));
  const draft = quotes.find(
    (quote) =>
      quote.status === "draft" &&
      quote.submissionRevision === submissionRevision,
  );
  const currentQuote = getCurrentQuoteForRevision(quotes, submissionRevision);
  const previousQuotes = getPreviousQuotes(
    quotes,
    currentQuote?._id.toString(),
  ).map(mapQuoteToAdminHistoryItemView);

  const canManage = project.status === "submitted";

  let unavailableReason: string | undefined;
  if (!canManage) {
    unavailableReason = "תמחור זמין רק לפרויקטים שנשלחו לבדיקה.";
  }

  let draftView = draft ? mapQuoteToAdminFormView(draft) : null;

  if (!draftView && canManage) {
    const baseLines = buildQuoteItemLinesFromProject(project);
    draftView = {
      quoteId: "",
      itemLines: baseLines.map((line) => ({
        projectItemId: line.projectItemId,
        productNameSnapshot: line.productNameSnapshot,
        configurationSummary: line.configurationSummary,
        quantity: line.quantity,
        unitPriceShekels: "",
        adminNote: "",
      })),
      additionalLines: [],
      totals: mapCalculationToTotalsView(
        calculateQuoteAmounts({
          itemLines: baseLines.map((line) => ({
            quantity: line.quantity,
            unitPriceAgorot: 0,
          })),
          additionalLines: [],
        }),
      ),
    };
  }

  return {
    projectId: project._id.toString(),
    submissionRevision,
    canManage,
    unavailableReason,
    draft: draftView,
    currentQuote: currentQuote
      ? mapQuoteToAdminDisplayView(currentQuote)
      : null,
    previousQuotes,
    approvalBlockedReason: getAdminQuoteApprovalBlockedReason({
      quoteEverSent,
      currentQuoteStatus: currentQuote?.status,
      projectStatus: project.status,
    }),
    quoteEverSent,
  };
}

export async function getProfessionalQuoteSectionView(
  ownerUserId: string,
  projectId: string,
): Promise<ProfessionalQuoteSectionView | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  }).lean();

  if (!project) {
    return null;
  }

  const submissionRevision = project.submissionRevision ?? 0;
  const quotes = (await ProjectQuote.find({
    projectId: project._id,
    status: { $in: PROFESSIONAL_VISIBLE_STATUSES },
  })
    .sort({ version: -1 })
    .lean()) as IProjectQuote[];

  const currentQuote = getCurrentQuoteForRevision(quotes, submissionRevision);
  const previousQuotes = getPreviousQuotes(
    quotes,
    currentQuote?._id.toString(),
  ).map(mapQuoteToProfessionalHistoryItemView);

  return {
    projectId: project._id.toString(),
    submissionRevision,
    currentQuote: currentQuote
      ? mapQuoteToProfessionalDisplayView(currentQuote, submissionRevision)
      : null,
    previousQuotes,
    actionHint: getProfessionalQuoteActionHint(currentQuote?.status) ?? undefined,
  };
}

export async function getAdminQuoteAttentionSummary(): Promise<AdminQuoteAttentionSummary> {
  await connectDB();

  const submittedProjects = await Project.find({ status: "submitted" })
    .select("_id submissionRevision")
    .lean();

  if (submittedProjects.length === 0) {
    return {
      quoteAcceptedAwaitingApprovalCount: 0,
      quoteChangeRequestedCount: 0,
      quoteAwaitingProfessionalCount: 0,
    };
  }

  const projectMeta = new Map(
    submittedProjects.map((project) => [
      project._id.toString(),
      project.submissionRevision ?? 0,
    ]),
  );

  const activeQuotes = (await ProjectQuote.find({
    projectId: { $in: submittedProjects.map((project) => project._id) },
    status: { $in: ["sent", "change_requested", "accepted"] },
  }).lean()) as IProjectQuote[];

  let quoteAcceptedAwaitingApprovalCount = 0;
  let quoteChangeRequestedCount = 0;
  let quoteAwaitingProfessionalCount = 0;

  for (const quote of activeQuotes) {
    const projectId = quote.projectId.toString();
    const revision = projectMeta.get(projectId);

    if (revision === undefined || quote.submissionRevision !== revision) {
      continue;
    }

    if (quote.status === "accepted") {
      quoteAcceptedAwaitingApprovalCount += 1;
    } else if (quote.status === "change_requested") {
      quoteChangeRequestedCount += 1;
    } else if (quote.status === "sent") {
      quoteAwaitingProfessionalCount += 1;
    }
  }

  return {
    quoteAcceptedAwaitingApprovalCount,
    quoteChangeRequestedCount,
    quoteAwaitingProfessionalCount,
  };
}

export async function getAdminProjectQuoteStatusSummaries(
  projectIds: string[],
): Promise<Map<string, AdminProjectQuoteStatusSummary>> {
  await connectDB();

  if (projectIds.length === 0) {
    return new Map();
  }

  const objectIds = projectIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  const projects = await Project.find({ _id: { $in: objectIds } })
    .select("_id submissionRevision status")
    .lean();

  const revisionByProjectId = new Map(
    projects.map((project) => [
      project._id.toString(),
      project.submissionRevision ?? 0,
    ]),
  );

  const quotes = (await ProjectQuote.find({
    projectId: { $in: objectIds },
    status: { $in: ["sent", "change_requested", "accepted"] },
  })
    .sort({ version: -1 })
    .lean()) as IProjectQuote[];

  const summaryMap = new Map<string, AdminProjectQuoteStatusSummary>();

  for (const quote of quotes) {
    const projectId = quote.projectId.toString();
    const revision = revisionByProjectId.get(projectId);

    if (revision === undefined || quote.submissionRevision !== revision) {
      continue;
    }

    if (summaryMap.has(projectId)) {
      continue;
    }

    const quoteAttention =
      quote.status === "accepted"
        ? "accepted"
        : quote.status === "change_requested"
          ? "change_requested"
          : quote.status === "sent"
            ? "awaiting_professional"
            : undefined;

    summaryMap.set(projectId, {
      quoteStatus: quote.status,
      quoteStatusLabel: getProjectQuoteStatusLabel(quote.status),
      quoteAttention,
    });
  }

  return summaryMap;
}

export async function projectHasAcceptedQuoteForCurrentRevision(
  projectId: string,
  submissionRevision: number,
): Promise<boolean> {
  await connectDB();

  const accepted = await ProjectQuote.exists({
    projectId: new Types.ObjectId(projectId),
    submissionRevision,
    status: "accepted",
  });

  return Boolean(accepted);
}
