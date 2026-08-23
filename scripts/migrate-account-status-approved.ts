import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";

async function migrateAccountStatusApproved(): Promise<void> {
  await connectDB();

  const result = await User.updateMany(
    {
      $or: [
        { accountStatus: { $exists: false } },
        { accountStatus: null },
      ],
    },
    { $set: { accountStatus: "approved" } },
  );

  console.log("Phase 18C accountStatus migration complete:");
  console.log(`  legacy users set to approved: ${result.modifiedCount}`);
}

migrateAccountStatusApproved()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Phase 18C accountStatus migration failed:", error);
    process.exit(1);
  });
