import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const updateOneMock = vi.fn();
const deleteOneMock = vi.fn();
const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: findOneMock,
  },
}));

vi.mock("@/models/ProjectPayment", () => ({
  default: {
    create: createMock,
    updateOne: updateOneMock,
    deleteOne: deleteOneMock,
  },
}));

describe("project-payment-mutations", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateOneMock.mockReset();
    deleteOneMock.mockReset();
    findOneMock.mockReset();
    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011" }),
      }),
    });
    createMock.mockResolvedValue({ _id: { toString: () => "507f1f77bcf86cd799439012" } });
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    deleteOneMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("creates payment with agorot amount", async () => {
    const { createProjectPaymentAsAdmin } = await import(
      "@/lib/projects/project-payment-mutations"
    );

    const paymentId = await createProjectPaymentAsAdmin("507f1f77bcf86cd799439013", {
      projectId: "507f1f77bcf86cd799439011",
      amountAgorot: 100_000,
      paymentDate: new Date("2026-08-31"),
      paymentMethod: "bank_transfer",
      note: "תשלום ראשון",
    });

    expect(paymentId).toBe("507f1f77bcf86cd799439012");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amountAgorot: 100_000,
        paymentMethod: "bank_transfer",
      }),
    );
  });

  it("updates existing payment", async () => {
    const { updateProjectPaymentAsAdmin } = await import(
      "@/lib/projects/project-payment-mutations"
    );

    await updateProjectPaymentAsAdmin("507f1f77bcf86cd799439013", {
      paymentId: "507f1f77bcf86cd799439012",
      projectId: "507f1f77bcf86cd799439011",
      amountAgorot: 250_000,
      paymentDate: new Date("2026-08-31"),
      paymentMethod: "cash",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: expect.anything(),
        projectId: expect.anything(),
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          amountAgorot: 250_000,
          paymentMethod: "cash",
        }),
      }),
    );
  });

  it("deletes payment by id", async () => {
    const { deleteProjectPaymentAsAdmin } = await import(
      "@/lib/projects/project-payment-mutations"
    );

    await deleteProjectPaymentAsAdmin(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
    );

    expect(deleteOneMock).toHaveBeenCalled();
  });

  it("rejects payment when project is not accessible", async () => {
    findOneMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });

    const { createProjectPaymentAsAdmin } = await import(
      "@/lib/projects/project-payment-mutations"
    );

    await expect(
      createProjectPaymentAsAdmin("507f1f77bcf86cd799439013", {
        projectId: "507f1f77bcf86cd799439011",
        amountAgorot: 100_000,
        paymentDate: new Date("2026-08-31"),
        paymentMethod: "bank_transfer",
      }),
    ).rejects.toThrow();
  });
});
