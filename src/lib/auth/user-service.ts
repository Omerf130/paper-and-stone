import { connectDB } from "@/lib/db/mongoose";
import User, { type IUser } from "@/models/User";
import { AUTH_ERRORS } from "./errors";
import { hashPassword, verifyPassword } from "./password";
import { normalizeEmail } from "./validation";

export async function createCustomerUser(
  email: string,
  password: string,
): Promise<IUser> {
  await connectDB();

  const passwordHash = await hashPassword(password);

  return User.create({
    email: normalizeEmail(email),
    passwordHash,
    role: "customer",
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
