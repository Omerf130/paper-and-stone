import { connectDB } from "@/lib/db/mongoose";
import {
  ARCHITECT_ROLE_FILTER,
  CLIENT_ROLE_FILTER,
} from "@/lib/auth/user-role";
import User from "@/models/User";

/**
 * Approved, active client accounts eligible for CRM and project assignment.
 * Matches CRM client list defaults plus assignment eligibility.
 */
export const APPROVED_ACTIVE_CLIENT_FILTER = {
  role: CLIENT_ROLE_FILTER,
  requestedRole: { $ne: "architect" as const },
  accountStatus: "approved" as const,
  isActive: true,
};

/**
 * Approved, active architect accounts in the operational CRM workspace.
 */
export const APPROVED_ACTIVE_ARCHITECT_FILTER = {
  role: ARCHITECT_ROLE_FILTER,
  accountStatus: "approved" as const,
  isActive: true,
};

export async function countApprovedActiveClients(): Promise<number> {
  await connectDB();
  return User.countDocuments(APPROVED_ACTIVE_CLIENT_FILTER);
}

export async function countApprovedActiveArchitects(): Promise<number> {
  await connectDB();
  return User.countDocuments(APPROVED_ACTIVE_ARCHITECT_FILTER);
}
