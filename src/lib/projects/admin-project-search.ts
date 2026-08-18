import { escapeRegex } from "@/lib/catalog/escape-regex";
import { buildClientSearchFilter } from "@/lib/admin/clients/client-lookup-queries";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";

export type AdminProjectSearchMatchIds = {
  ownerUserIds: string[];
  clientUserIds: string[];
};

export async function resolveAdminProjectSearchMatchIds(
  query: string,
): Promise<AdminProjectSearchMatchIds> {
  const regex = escapeRegex(query);

  const [matchingUsers, matchingProfiles, matchingClients] = await Promise.all([
    User.find({
      $or: [
        { email: { $regex: regex, $options: "i" } },
        { fullName: { $regex: regex, $options: "i" } },
      ],
    })
      .select("_id")
      .lean(),
    ProfessionalProfile.find({
      fullName: { $regex: regex, $options: "i" },
    })
      .select("userId")
      .lean(),
    User.find(buildClientSearchFilter(query)).select("_id").lean(),
  ]);

  const ownerUserIds = new Set<string>();

  for (const user of matchingUsers) {
    ownerUserIds.add(user._id.toString());
  }

  for (const profile of matchingProfiles) {
    ownerUserIds.add(profile.userId.toString());
  }

  return {
    ownerUserIds: [...ownerUserIds],
    clientUserIds: matchingClients.map((user) => user._id.toString()),
  };
}

export function buildAdminProjectSearchOrClause(input: {
  query: string;
  ownerUserIds: string[];
  clientUserIds: string[];
}): Record<string, unknown> {
  const regex = escapeRegex(input.query);
  const searchOr: Record<string, unknown>[] = [
    { name: { $regex: regex, $options: "i" } },
    { clientName: { $regex: regex, $options: "i" } },
  ];

  if (input.ownerUserIds.length > 0) {
    searchOr.push({ ownerUserId: { $in: input.ownerUserIds } });
  }

  if (input.clientUserIds.length > 0) {
    searchOr.push({ clientUserId: { $in: input.clientUserIds } });
  }

  return { $or: searchOr };
}
