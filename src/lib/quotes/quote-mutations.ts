import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ProjectQuote from "@/models/ProjectQuote";
import type { IProject } from "@/models/Project";
import {
  assertProjectItemsMatchQuoteInput,
  buildQuoteItemLinesFromProject,
} from "@/lib/quotes/buildQuoteItemLinesFromProject";
import { calculateQuoteAmounts } from "@/lib/quotes/quote-calculations";
import { QuoteMutationError, QUOTE_ERRORS } from "@/lib/quotes/quote-errors";
import { mapCalculationToQuoteDocumentFields } from "@/lib/quotes/mapQuoteToView";
import {
  type ParsedQuotePricingInput,
  type ParsedSaveQuoteDraftInput,
} from "@/lib/quotes/quote-validation";
import { hasQuoteEverBeenSent, supersedeActiveQuotes } from "@/lib/quotes/supersedeActiveQuotes";
import { assertLayeredPricingApprovalGate } from "@/lib/pricing/pricing-gates";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";
import { createQuoteNotification } from "@/lib/notifications/createQuoteNotification";

const QUOTABLE_PROJECT_STATUS = "submitted";

async function getQuotableProject(projectId: string): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new QuoteMutationError(QUOTE_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    status: QUOTABLE_PROJECT_STATUS,
  });

  if (!project) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_QUOTABLE);
  }

  return project;
}

function buildPersistedItemLines(
  project: IProject,
  pricing: ParsedQuotePricingInput,
) {
  const baseLines = buildQuoteItemLinesFromProject(project);
  const pricingByItemId = new Map(
    pricing.itemLines.map((line) => [line.projectItemId, line]),
  );

  return baseLines.map((baseLine) => {
    const pricingLine = pricingByItemId.get(baseLine.projectItemId);

    if (!pricingLine) {
      throw new QuoteMutationError(QUOTE_ERRORS.ITEMS_MISMATCH);
    }

    return {
      ...baseLine,
      unitPriceAgorot: pricingLine.unitPriceAgorot,
      adminNote: pricingLine.adminNote,
    };
  });
}

function buildQuotePayload(
  project: IProject,
  pricing: ParsedQuotePricingInput,
) {
  try {
    assertProjectItemsMatchQuoteInput(
      project,
      pricing.itemLines.map((line) => line.projectItemId),
    );
  } catch {
    throw new QuoteMutationError(QUOTE_ERRORS.ITEMS_MISMATCH);
  }

  const persistedItemLines = buildPersistedItemLines(project, pricing);
  const calculation = calculateQuoteAmounts({
    itemLines: persistedItemLines.map((line) => ({
      quantity: line.quantity,
      unitPriceAgorot: line.unitPriceAgorot,
    })),
    additionalLines: pricing.additionalLines,
  });

  if (calculation.totalAgorot < 0) {
    throw new QuoteMutationError(QUOTE_ERRORS.TOTAL_NEGATIVE);
  }

  return {
    calculation,
    documentFields: mapCalculationToQuoteDocumentFields(
      calculation,
      persistedItemLines,
      pricing.additionalLines,
    ),
    generalNote: pricing.generalNote,
    validUntil: pricing.validUntil,
  };
}

async function getNextQuoteVersion(projectId: string): Promise<number> {
  const latest = await ProjectQuote.findOne({
    projectId: new Types.ObjectId(projectId),
  })
    .sort({ version: -1 })
    .select("version")
    .lean();

  return (latest?.version ?? 0) + 1;
}

export async function saveQuoteDraft(
  adminUserId: string,
  input: ParsedSaveQuoteDraftInput,
  pricing: ParsedQuotePricingInput,
): Promise<string> {
  const project = await getQuotableProject(input.projectId);
  const payload = buildQuotePayload(project, pricing);
  const submissionRevision = project.submissionRevision ?? 0;

  const existingDraft = await ProjectQuote.findOne({
    projectId: project._id,
    status: "draft",
    submissionRevision,
  });

  const draftFields = {
    ...payload.documentFields,
    generalNote: payload.generalNote,
    validUntil: payload.validUntil,
    submissionRevision,
    professionalUserId: project.ownerUserId,
    currency: "ILS" as const,
    createdByAdminUserId: new Types.ObjectId(adminUserId),
  };

  if (existingDraft) {
    existingDraft.set({
      ...draftFields,
      version: 0,
      status: "draft",
    });
    await existingDraft.save();
    return existingDraft._id.toString();
  }

  const draft = await ProjectQuote.create({
    projectId: project._id,
    version: 0,
    status: "draft",
    ...draftFields,
  });

  return draft._id.toString();
}

export async function sendProjectQuote(
  adminUserId: string,
  input: ParsedSaveQuoteDraftInput,
  pricing: ParsedQuotePricingInput,
): Promise<string> {
  const project = await getQuotableProject(input.projectId);
  const payload = buildQuotePayload(project, pricing);
  const submissionRevision = project.submissionRevision ?? 0;
  const now = new Date();

  await supersedeActiveQuotes(project._id.toString(), "new_version", {
    submissionRevision,
  });

  const nextVersion = await getNextQuoteVersion(project._id.toString());

  const existingDraft = await ProjectQuote.findOne({
    projectId: project._id,
    status: "draft",
    submissionRevision,
  });

  const sentFields = {
    ...payload.documentFields,
    generalNote: payload.generalNote,
    validUntil: payload.validUntil,
    submissionRevision,
    professionalUserId: project.ownerUserId,
    currency: "ILS" as const,
    version: nextVersion,
    status: "sent" as const,
    sentAt: now,
    sentByAdminUserId: new Types.ObjectId(adminUserId),
    createdByAdminUserId: new Types.ObjectId(adminUserId),
  };

  let quoteId: string;

  if (existingDraft) {
    existingDraft.set(sentFields);
    await existingDraft.save();
    quoteId = existingDraft._id.toString();
  } else {
    const quote = await ProjectQuote.create({
      projectId: project._id,
      ...sentFields,
    });
    quoteId = quote._id.toString();
  }

  await createQuoteNotification({
    recipientUserId: project.ownerUserId.toString(),
    type: "PROJECT_QUOTE_SENT",
    projectId: project._id.toString(),
    quoteId,
    projectNameSnapshot: project.name,
    totalAgorot: payload.calculation.totalAgorot,
  });

  return quoteId;
}

export async function acceptProjectQuote(
  ownerUserId: string,
  quoteId: string,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(quoteId)) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_FOUND);
  }

  const quote = await ProjectQuote.findById(quoteId);

  if (!quote || quote.professionalUserId.toString() !== ownerUserId) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_FOUND);
  }

  if (quote.status === "accepted") {
    return;
  }

  if (quote.status !== "sent") {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_ACTIONABLE);
  }

  const project = await Project.findOne({
    _id: quote.projectId,
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: QUOTABLE_PROJECT_STATUS,
  }).select("_id submissionRevision status");

  if (!project) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_QUOTABLE);
  }

  const submissionRevision = project.submissionRevision ?? 0;

  if (quote.submissionRevision !== submissionRevision) {
    throw new QuoteMutationError(QUOTE_ERRORS.REVISION_MISMATCH);
  }

  const result = await ProjectQuote.updateOne(
    {
      _id: quote._id,
      status: "sent",
      submissionRevision,
    },
    {
      $set: {
        status: "accepted",
        acceptedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_ACTIONABLE);
  }
}

export async function requestProjectQuoteChange(
  ownerUserId: string,
  quoteId: string,
  message: string,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(quoteId)) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_FOUND);
  }

  const quote = await ProjectQuote.findById(quoteId);

  if (!quote || quote.professionalUserId.toString() !== ownerUserId) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_FOUND);
  }

  if (quote.status === "change_requested") {
    return;
  }

  if (quote.status !== "sent") {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_ACTIONABLE);
  }

  const project = await Project.findOne({
    _id: quote.projectId,
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: QUOTABLE_PROJECT_STATUS,
  }).select("_id submissionRevision status");

  if (!project) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_QUOTABLE);
  }

  const submissionRevision = project.submissionRevision ?? 0;

  if (quote.submissionRevision !== submissionRevision) {
    throw new QuoteMutationError(QUOTE_ERRORS.REVISION_MISMATCH);
  }

  const result = await ProjectQuote.updateOne(
    {
      _id: quote._id,
      status: "sent",
      submissionRevision,
    },
    {
      $set: {
        status: "change_requested",
        changeRequestMessage: message.trim(),
        changeRequestedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new QuoteMutationError(QUOTE_ERRORS.NOT_ACTIONABLE);
  }
}

export async function assertQuoteApprovalGate(projectId: string): Promise<void> {
  await connectDB();

  const project = await Project.findById(projectId).select(
    "submissionRevision onboardingStatus items",
  );

  if (!project) {
    throw new QuoteMutationError(QUOTE_ERRORS.PROJECT_NOT_FOUND);
  }

  if (usesLayeredPricing(project)) {
    try {
      assertLayeredPricingApprovalGate(project);
    } catch (error: unknown) {
      if (error instanceof ProjectMutationError) {
        throw new QuoteMutationError(error.message);
      }
      throw error;
    }
    return;
  }

  const everSent = await hasQuoteEverBeenSent(projectId);

  if (!everSent) {
    return;
  }

  const submissionRevision = project.submissionRevision ?? 0;

  const acceptedQuote = await ProjectQuote.findOne({
    projectId: new Types.ObjectId(projectId),
    submissionRevision,
    status: "accepted",
  }).sort({ version: -1 });

  if (!acceptedQuote) {
    throw new QuoteMutationError(QUOTE_ERRORS.APPROVAL_REQUIRES_ACCEPTED_QUOTE);
  }
}

export { hasQuoteEverBeenSent };
