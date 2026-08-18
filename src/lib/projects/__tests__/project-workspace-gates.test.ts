import { describe, expect, it } from "vitest";
import {
  canResubmitOnboarding,
  isLegacyProject,
  isMessagingAvailable,
  isProjectItemEditable,
  isProjectItemWorkspaceVisible,
  isProjectMetadataEditable,
  isProjectOnboardingActive,
  isProjectOnboardingDeletable,
  isProjectWorkspaceActive,
} from "@/lib/projects/project-workspace-gates";

const legacyDraft = {
  status: "draft" as const,
  onboardingStatus: undefined,
  reviewHistory: [],
};

const pendingProject = {
  status: "draft" as const,
  onboardingStatus: "pending_approval" as const,
  reviewHistory: [{ action: "onboarding_created" as const }],
};

const activeProject = {
  status: "draft" as const,
  onboardingStatus: "active" as const,
  reviewHistory: [{ action: "onboarding_approved" as const }],
  onboardingApprovedAt: new Date(),
};

const rejectedProject = {
  status: "draft" as const,
  onboardingStatus: "rejected" as const,
  reviewHistory: [{ action: "onboarding_rejected" as const }],
};

describe("project-workspace-gates", () => {
  it("detects legacy projects without onboardingStatus", () => {
    expect(isLegacyProject(legacyDraft)).toBe(true);
    expect(isLegacyProject(pendingProject)).toBe(false);
  });

  it("blocks item edits until onboarding is active for new workflow", () => {
    expect(isProjectItemEditable(pendingProject)).toBe(false);
    expect(isProjectItemEditable(rejectedProject)).toBe(false);
    expect(isProjectItemEditable(activeProject)).toBe(true);
    expect(isProjectItemEditable(legacyDraft)).toBe(true);
  });

  it("allows metadata edits during onboarding pending/rejected/active", () => {
    expect(isProjectMetadataEditable(pendingProject)).toBe(true);
    expect(isProjectMetadataEditable(rejectedProject)).toBe(true);
    expect(isProjectMetadataEditable(activeProject)).toBe(true);
  });

  it("hides item workspace until onboarding active", () => {
    expect(isProjectItemWorkspaceVisible(pendingProject)).toBe(false);
    expect(isProjectItemWorkspaceVisible(activeProject)).toBe(true);
    expect(isProjectItemWorkspaceVisible(legacyDraft)).toBe(true);
  });

  it("allows delete for pending/rejected onboarding before approval", () => {
    expect(isProjectOnboardingDeletable(pendingProject)).toBe(true);
    expect(isProjectOnboardingDeletable(rejectedProject)).toBe(true);
    expect(isProjectOnboardingDeletable(activeProject)).toBe(false);
  });

  it("enables messaging for onboarding projects immediately", () => {
    expect(isMessagingAvailable(pendingProject)).toBe(true);
    expect(isMessagingAvailable(legacyDraft)).toBe(false);
    expect(
      isMessagingAvailable({
        ...legacyDraft,
        reviewHistory: [{ action: "submitted" }],
      }),
    ).toBe(true);
  });

  it("supports resubmit only from rejected onboarding", () => {
    expect(canResubmitOnboarding(rejectedProject)).toBe(true);
    expect(canResubmitOnboarding(pendingProject)).toBe(false);
  });

  it("requires active onboarding for workspace on new projects", () => {
    expect(isProjectOnboardingActive(activeProject)).toBe(true);
    expect(isProjectWorkspaceActive(activeProject)).toBe(true);
    expect(isProjectWorkspaceActive(pendingProject)).toBe(false);
  });
});
