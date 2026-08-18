import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";

export async function getSubmittedProjectCount(): Promise<number> {
  await connectDB();

  return Project.countDocuments({ status: "submitted" });
}

export async function getPendingOnboardingProjectCount(): Promise<number> {
  await connectDB();

  return Project.countDocuments({ onboardingStatus: "pending_approval" });
}
