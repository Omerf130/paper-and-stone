"use client";

import type { ProjectRoomView } from "@/types/project-room";
import styles from "./AdminProjectRoomToolbar.module.scss";

type RoomSelection = { kind: "room"; roomId: string } | { kind: "orphan" };

type AdminProjectRoomToolbarProps = {
  sortedRooms: ProjectRoomView[];
  orphanCount: number;
  selection: RoomSelection;
  onSelectionChange: (selection: RoomSelection) => void;
  onPreviousRoom: () => void;
  onNextRoom: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onAddRoom?: () => void;
};

export default function AdminProjectRoomToolbar({
  sortedRooms,
  orphanCount,
  selection,
  onSelectionChange,
  onPreviousRoom,
  onNextRoom,
  canGoPrevious,
  canGoNext,
  onAddRoom,
}: AdminProjectRoomToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <span className={styles.label}>חדר</span>
        <span className={styles.roomIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 11V5.5L7 3l4.5 2.5V11"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path d="M5.5 11V8h3v3" stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
        <select
          id="admin-room-selector"
          className={styles.select}
          value={selection.kind === "room" ? selection.roomId : "__orphan__"}
          onChange={(event) => {
            const value = event.target.value;

            if (value === "__orphan__") {
              onSelectionChange({ kind: "orphan" });
              return;
            }

            onSelectionChange({ kind: "room", roomId: value });
          }}
        >
          {sortedRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.itemCount})
            </option>
          ))}
          {orphanCount > 0 ? (
            <option value="__orphan__">ללא חדר ({orphanCount})</option>
          ) : null}
        </select>

        {sortedRooms.length > 1 && selection.kind === "room" ? (
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.navButton}
              onClick={onPreviousRoom}
              disabled={!canGoPrevious}
              aria-label="חדר קודם"
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onNextRoom}
              disabled={!canGoNext}
              aria-label="חדר הבא"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {onAddRoom ? (
        <button type="button" className={styles.addRoom} onClick={onAddRoom}>
          + הוסף חדר
        </button>
      ) : null}
    </div>
  );
}
