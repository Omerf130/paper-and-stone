import { connectDB } from "@/lib/db/mongoose";
import User, { type IUser } from "@/models/User";
import type { RegisterInput } from "./validation";
import { AUTH_ERRORS } from "./errors";
import { hashPassword, verifyPassword } from "./password";
import { normalizeEmail } from "./validation";

export type CreateRegisteredUserInput = Pick<
  RegisterInput,
  "email" | "password" | "fullName" | "identificationNumber" | "userType"
>;

export async function createRegisteredUser(
  input: CreateRegisteredUserInput,
): Promise<IUser> {
  await connectDB();

  const passwordHash = await hashPassword(input.password);
  const requestedRole = input.userType === "architect" ? "architect" : null;

  return User.create({
    email: normalizeEmail(input.email),
    passwordHash,
    fullName: input.fullName,
    identificationNumber: input.identificationNumber,
    role: "client",
    requestedRole,
    accountStatus: "pending",
    isActive: true,
  });
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ email: normalizeEmail(email) });
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<IUser | null> {
  const user = await findUserByEmail(email);

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function emailExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user !== null;
}

export { AUTH_ERRORS };
