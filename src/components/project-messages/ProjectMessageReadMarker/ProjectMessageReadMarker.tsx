"use client";

import { useEffect, useRef } from "react";

type ProjectMessageReadMarkerProps = {
  projectId: string;
  messagingAvailable: boolean;
  markReadAction: (projectId: string) => Promise<void>;
};

export default function ProjectMessageReadMarker({
  projectId,
  messagingAvailable,
  markReadAction,
}: ProjectMessageReadMarkerProps) {
  const markedRef = useRef(false);

  useEffect(() => {
    if (!messagingAvailable || markedRef.current) {
      return;
    }

    markedRef.current = true;
    void markReadAction(projectId);
  }, [projectId, messagingAvailable, markReadAction]);

  return null;
}
