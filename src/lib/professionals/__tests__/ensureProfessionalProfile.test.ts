import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findOneAndUpdateMock = vi.fn();
const updateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProfessionalProfile", () => ({
  default: {
    findOneAndUpdate: findOneAndUpdateMock,
    updateOne: updateOneMock,
  },
}));

const userId = "507f1f77bcf86cd799439011";

function createProfileDoc(overrides: Record<string, unknown> = {}) {
  const id = new Types.ObjectId();
  const userObjectId = new Types.ObjectId(userId);
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  const updatedAt = new Date("2026-01-02T00:00:00.000Z");

  return {
    _id: id,
    userId: userObjectId,
    fullName: undefined,
    phone: undefined,
    companyName: undefined,
    city: undefined,
    bio: undefined,
    createdAt,
    updatedAt,
    ...overrides,
  };
}

describe("ensureProfessionalProfile", () => {
  beforeEach(() => {
    findOneAndUpdateMock.mockReset();
    updateOneMock.mockReset();
  });

  it("creates profile on first call via atomic upsert", async () => {
    const profileDoc = createProfileDoc();
    findOneAndUpdateMock.mockResolvedValue(profileDoc);

    const { ensureProfessionalProfile } = await import(
      "@/lib/professionals/ensureProfessionalProfile"
    );

    const result = await ensureProfessionalProfile(userId);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );
    expect(result.userId).toBe(userId);
    expect(result.id).toBe(profileDoc._id.toString());
  });

  it("returns same profile on second call", async () => {
    const profileDoc = createProfileDoc({
      fullName: "דנה לוי",
      phone: "050-1234567",
    });
    findOneAndUpdateMock.mockResolvedValue(profileDoc);

    const { ensureProfessionalProfile } = await import(
      "@/lib/professionals/ensureProfessionalProfile"
    );

    const first = await ensureProfessionalProfile(userId);
    const second = await ensureProfessionalProfile(userId);

    expect(second.id).toBe(first.id);
    expect(second.fullName).toBe("דנה לוי");
    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(2);
  });

  it("does not overwrite existing profile fields via $setOnInsert only", async () => {
    const profileDoc = createProfileDoc({
      fullName: "דנה לוי",
      phone: "050-1234567",
      companyName: "סטודיו לוי",
      city: "תל אביב",
      bio: "מעצבת פנים",
    });
    findOneAndUpdateMock.mockResolvedValue(profileDoc);

    const { ensureProfessionalProfile } = await import(
      "@/lib/professionals/ensureProfessionalProfile"
    );

    await ensureProfessionalProfile(userId);

    const updateArg = findOneAndUpdateMock.mock.calls[0]?.[1];
    expect(updateArg).toEqual({
      $setOnInsert: {
        userId: new Types.ObjectId(userId),
      },
    });
    expect(updateArg).not.toHaveProperty("$set");
  });

  it("uses userId as unique lookup key", async () => {
    findOneAndUpdateMock.mockResolvedValue(createProfileDoc());

    const { ensureProfessionalProfile } = await import(
      "@/lib/professionals/ensureProfessionalProfile"
    );

    await ensureProfessionalProfile(userId);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      expect.any(Object),
      expect.any(Object),
    );
  });
});

describe("updateMyProfessionalProfile", () => {
  beforeEach(() => {
    updateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("updates profile fields scoped to authenticated userId", async () => {
    const { updateMyProfessionalProfile } = await import(
      "@/lib/professionals/updateMyProfessionalProfile"
    );

    await updateMyProfessionalProfile(userId, {
      fullName: "דנה לוי",
      phone: "050-1234567",
      companyName: "סטודיו לוי",
      city: "תל אביב",
      bio: "מעצבת פנים",
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          fullName: "דנה לוי",
          phone: "050-1234567",
          companyName: "סטודיו לוי",
          city: "תל אביב",
          bio: "מעצבת פנים",
        },
      },
    );
  });

  it("throws when profile is missing", async () => {
    updateOneMock.mockResolvedValue({ matchedCount: 0 });

    const { updateMyProfessionalProfile } = await import(
      "@/lib/professionals/updateMyProfessionalProfile"
    );
    const { PROFILE_ERRORS } = await import(
      "@/lib/professionals/profile-validation"
    );

    await expect(
      updateMyProfessionalProfile(userId, { fullName: "דנה לוי" }),
    ).rejects.toMatchObject({
      message: PROFILE_ERRORS.GENERIC,
    });
  });
});
