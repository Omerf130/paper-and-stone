import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectQuote from "@/models/ProjectQuote";
import type { ProjectQuoteSupersedeReason } from "@/types/project-quote";

const ACTIVE_QUOTE_STATUSES = ["draft", "sent", "change_requested"] as const;

export async function supersedeActiveQuotes(
  projectId: string,
  reason: ProjectQuoteSupersedeReason,
  options?: { submissionRevision?: number },
): Promise<void> {
  await connectDB();

  const filter: Record<string, unknown> = {
    projectId: new Types.ObjectId(projectId),
    status: { $in: ACTIVE_QUOTE_STATUSES },
  };

  if (options?.submissionRevision !== undefined) {
    filter.submissionRevision = options.submissionRevision;
  }

  const now = new Date();

  await ProjectQuote.updateMany(filter, {
    $set: {
      status: "superseded",
      supersededAt: now,
      supersededReason: reason,
    },
  });
}

export async function hasQuoteEverBeenSent(projectId: string): Promise<boolean> {
  await connectDB();

  const exists = await ProjectQuote.exists({
    projectId: new Types.ObjectId(projectId),
    sentAt: { $ne: null },
  });

  return Boolean(exists);
}
