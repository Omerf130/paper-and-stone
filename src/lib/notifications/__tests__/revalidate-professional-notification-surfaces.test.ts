import { describe, expect, it, vi, beforeEach } from "vitest";

const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("revalidateProfessionalNotificationSurfaces", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
  });

  it("revalidates notifications page and professional layout", async () => {
    const { revalidateProfessionalNotificationSurfaces } = await import(
      "@/lib/notifications/revalidate-professional-notification-surfaces"
    );

    revalidateProfessionalNotificationSurfaces();

    expect(revalidatePathMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/professional/notifications",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/professional");
  });
});
