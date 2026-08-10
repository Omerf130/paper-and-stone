import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { hashPassword } from "./password";
import { normalizeEmail } from "./validation";

export async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail?.trim()) {
    console.log("Admin seed skipped: ADMIN_EMAIL not configured");
    return;
  }

  await connectDB();

  const email = normalizeEmail(adminEmail);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    await User.updateOne({ email }, { role: "admin", isActive: true });
    console.log("Admin user seeded");
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.log(
      "Admin seed skipped: ADMIN_PASSWORD required to create new admin",
    );
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  await User.create({
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("Admin user seeded");
}
