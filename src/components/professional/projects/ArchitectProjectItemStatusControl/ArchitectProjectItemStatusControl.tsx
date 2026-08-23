"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setArchitectProjectItemStatusAction } from "@/app/professional/projects/item-status-actions";
import ProjectItemStatusMenuControl from "@/components/shared/ProjectItemStatusMenu/ProjectItemStatusMenuControl";
import { getArchitectStatusMenuOptions } from "@/lib/project-items/project-item-status-menu-options";
import type {
  ProjectItemStatus,
  ProjectItemStatusPresentation,
} from "@/types/project-item-status";

type ArchitectProjectItemStatusControlProps = {
  projectId: string;
  projectItemId: string;
  status: ProjectItemStatus;
  allowedTargetStatuses: ProjectItemStatus[];
  presentation?: ProjectItemStatusPresentation;
  isEditable: boolean;
};

export default function ArchitectProjectItemStatusControl({
  projectId,
  projectItemId,
  status,
  allowedTargetStatuses,
  presentation,
  isEditable,
}: ArchitectProjectItemStatusControlProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (targetStatus: ProjectItemStatus) => {
    if (targetStatus === status) {
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await setArchitectProjectItemStatusAction({
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

  const menuOptions = getArchitectStatusMenuOptions(allowedTargetStatuses);
  const isInteractive = isEditable && menuOptions.length > 0;

  return (
    <ProjectItemStatusMenuControl
      status={status}
      role="architect"
      presentation={presentation}
      options={menuOptions}
      onSelect={handleSelect}
      isPending={isPending}
      interactive={isInteractive}
      size="prominent"
      error={error}
    />
  );
}
