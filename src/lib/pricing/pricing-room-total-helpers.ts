import { formatIlsAgorot } from "@/lib/money/format-ils";
import type { ProjectItemView } from "@/types/project";

export function getRoomClientTotalFormatted(
  roomItems: ProjectItemView[],
): string | undefined {
  if (
    roomItems.length === 0 ||
    !roomItems.every(
      (item) =>
        item.adminPricing?.pricingStatus === "priced" &&
        item.adminPricing.clientLineTotalAgorot != null,
    )
  ) {
    return undefined;
  }

  const totalAgorot = roomItems.reduce(
    (sum, item) => sum + (item.adminPricing?.clientLineTotalAgorot ?? 0),
    0,
  );

  return formatIlsAgorot(totalAgorot);
}

export function getRoomArchitectProfitTotalFormatted(
  roomItems: ProjectItemView[],
): string | undefined {
  if (
    roomItems.length === 0 ||
    !roomItems.every(
      (item) =>
        item.architectPricing?.pricingStatus === "priced" &&
        item.architectPricing.architectProfitLineTotalAgorot != null,
    )
  ) {
    return undefined;
  }

  const totalAgorot = roomItems.reduce(
    (sum, item) => sum + (item.architectPricing?.architectProfitLineTotalAgorot ?? 0),
    0,
  );

  return formatIlsAgorot(totalAgorot);
}
