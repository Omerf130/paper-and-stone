"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminProjectItemStatusAction } from "@/app/admin/projects/item-status-actions";
import ProjectItemStatusMenuControl from "@/components/shared/ProjectItemStatusMenu/ProjectItemStatusMenuControl";
import { getAdminStatusMenuOptions } from "@/lib/project-items/project-item-status-menu-options";
import type {
  ProjectItemStatus,
  ProjectItemStatusPresentation,
} from "@/types/project-item-status";

type AdminProjectItemStatusControlProps = {
  projectId: string;
  projectItemId: string;
  status: ProjectItemStatus;
  presentation?: ProjectItemStatusPresentation;
};

export default function AdminProjectItemStatusControl({
  projectId,
  projectItemId,
  status,
  presentation,
}: AdminProjectItemStatusControlProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (targetStatus: ProjectItemStatus) => {
    if (targetStatus === status) {
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await setAdminProjectItemStatusAction({
        projectId,
        projectItemId,
        targetStatus,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <ProjectItemStatusMenuControl
      status={status}
      role="admin"
      presentation={presentation}
      options={getAdminStatusMenuOptions(status, "admin")}
      onSelect={handleSelect}
      isPending={isPending}
      interactive
      size="prominent"
      error={error}
    />
  );
}
