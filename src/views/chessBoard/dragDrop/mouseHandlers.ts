import { SquareView } from "../boardLayoutHelpers";
import { createSquareFromView, DropContext, parseDragFromPayload, playMove } from "./shared";
import { createGhostElement, createTransparentPixelImage, updateGhostPosition } from "./ghost";

export function handleDragStart(event: DragEvent, square: SquareView): void {
  if (!square.piece) {
    return;
  }
  const transfer = event.dataTransfer;
  if (!transfer) {
    return;
  }
  transfer.effectAllowed = "move";
  transfer.setData("application/x-chess-from", JSON.stringify({ file: square.file, rank: square.rank }));
  const ghost = createGhostElement(square.piece);
  if (ghost) {
    updateGhostPosition(ghost, event.clientX, event.clientY);
  }

  const target = event.target as HTMLElement;
  const cleanup = (): void => {
    if (ghost?.parentElement) {
      ghost.parentElement.removeChild(ghost);
    }
    document.removeEventListener("dragover", handleMove);
  };

  const handleMove = (moveEvent: DragEvent): void => {
    if (!ghost) {
      return;
    }
    updateGhostPosition(ghost, moveEvent.clientX, moveEvent.clientY);
  };

  document.addEventListener("dragover", handleMove);

  const transparent = createTransparentPixelImage();
  transfer.setDragImage(transparent, 0, 0);

  target.addEventListener("dragend", cleanup, { once: true });
}

export function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  const transfer = event.dataTransfer;
  if (transfer) {
    transfer.dropEffect = "move";
  }
}

export function createHandleDrop(context: DropContext): (event: DragEvent, target: SquareView) => void {
  return (event, target) => {
    if (!context.isHumanTurn) {
      return;
    }
    event.preventDefault();
    const transfer = event.dataTransfer;
    if (!transfer) {
      return;
    }
    const payload = transfer.getData("application/x-chess-from");
    if (!payload) {
      return;
    }
    const from = parseDragFromPayload(payload);
    if (!from) {
      context.setError("Could not parse move");
      return;
    }
    const to = createSquareFromView(target);
    playMove(context, from, to);
  };
}
