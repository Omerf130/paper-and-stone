import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";

async function migrateUserRoles17a(): Promise<void> {
  await connectDB();

  const customerResult = await User.updateMany(
    { role: "customer" },
    { $set: { role: "client" } },
  );

  const professionalResult = await User.updateMany(
    { role: "professional" },
    { $set: { role: "architect" } },
  );

  const requestedRoleCleanup = await User.updateMany(
    { requestedRole: { $exists: false } },
    { $set: { requestedRole: null } },
  );

  console.log("Phase 17A role migration complete:");
  console.log(`  customer → client: ${customerResult.modifiedCount}`);
  console.log(`  professional → architect: ${professionalResult.modifiedCount}`);
  console.log(
    `  requestedRole initialized: ${requestedRoleCleanup.modifiedCount}`,
  );
}

migrateUserRoles17a()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Phase 17A role migration failed:", error);
    process.exit(1);
  });
