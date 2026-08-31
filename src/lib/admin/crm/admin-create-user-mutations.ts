import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { hashPassword } from "@/lib/auth/password";
import { emailExists } from "@/lib/auth/user-service";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { UserMutationError } from "@/lib/users/user-errors";
import type { AdminCreateUserInput } from "@/lib/admin/crm/admin-create-user-validation";
import { CRM_ERRORS } from "@/types/admin-crm";

export async function createClientAsAdmin(
  input: AdminCreateUserInput,
): Promise<string> {
  await connectDB();

  if (await emailExists(input.email)) {
    throw new UserMutationError(CRM_ERRORS.EMAIL_EXISTS);
  }

  const passwordHash = await hashPassword(input.initialPassword);

  const user = await User.create({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    identificationNumber: input.identificationNumber,
    role: "client",
    requestedRole: null,
    accountStatus: "approved",
    isActive: true,
  });

  return user._id.toString();
}

export async function createArchitectAsAdmin(
  input: AdminCreateUserInput,
): Promise<string> {
  await connectDB();

  if (await emailExists(input.email)) {
    throw new UserMutationError(CRM_ERRORS.EMAIL_EXISTS);
  }

  const passwordHash = await hashPassword(input.initialPassword);

  const user = await User.create({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    identificationNumber: input.identificationNumber,
    role: "architect",
    requestedRole: null,
    accountStatus: "approved",
    isActive: true,
  });

  const userId = user._id.toString();
  await ensureProfessionalProfile(userId);

  await ProfessionalProfile.updateOne(
    { userId: user._id },
    { $set: { fullName: input.fullName } },
  );

  return userId;
}
