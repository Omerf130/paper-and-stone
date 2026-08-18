"use client";

import Button from "@/components/ui/Button/Button";
import type { ProjectRoomView } from "@/types/project-room";
import styles from "./ProjectRoomNav.module.scss";

type ProjectRoomNavProps = {
  rooms: ProjectRoomView[];
  selectedRoomId: string | null;
  isEditable: boolean;
  onSelectRoom: (roomId: string) => void;
  onMoveUp: (roomId: string) => void;
  onMoveDown: (roomId: string) => void;
  onRename: (room: ProjectRoomView) => void;
  onDelete: (room: ProjectRoomView) => void;
  onCreateRoom: () => void;
  disabled?: boolean;
};

export default function ProjectRoomNav({
  rooms,
  selectedRoomId,
  isEditable,
  onSelectRoom,
  onMoveUp,
  onMoveDown,
  onRename,
  onDelete,
  onCreateRoom,
  disabled = false,
}: ProjectRoomNavProps) {
  return (
    <nav className={styles.nav} aria-label="חדרים בפרויקט">
      <ul className={styles.list}>
        {rooms.map((room, index) => {
          const isSelected = room.id === selectedRoomId;

          return (
            <li key={room.id} className={styles.item}>
              <button
                type="button"
                className={isSelected ? styles.roomActive : styles.roomButton}
                aria-current={isSelected ? "true" : undefined}
                onClick={() => onSelectRoom(room.id)}
                disabled={disabled}
              >
                <span className={styles.roomName}>{room.name}</span>
                <span className={styles.itemCount}>{room.itemCount}</span>
              </button>

              {isEditable ? (
                <div className={styles.roomActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveUp(room.id)}
                    disabled={disabled || index === 0}
                    aria-label={`הזזת ${room.name} למעלה`}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveDown(room.id)}
                    disabled={disabled || index === rooms.length - 1}
                    aria-label={`הזזת ${room.name} למטה`}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRename(room)}
                    disabled={disabled}
                  >
                    שינוי שם
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(room)}
                    disabled={disabled}
                  >
                    מחיקה
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {isEditable ? (
        <div className={styles.createWrap}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCreateRoom}
            disabled={disabled}
          >
            + חדר חדש
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
