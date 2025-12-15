import React from "react";
import { pieceSprite } from "../pieceHelpers";
import { SquareView } from "../boardLayoutHelpers";
import { createSquareFromView, DropContext, parseDragFromPayload, playMove } from "./shared";

export function handleDragStart(event: React.DragEvent<HTMLDivElement>, square: SquareView): void {
  if (!square.piece) {
    return;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-chess-from", JSON.stringify({ file: square.file, rank: square.rank }));
  const sprite = pieceSprite(square.piece);
  const ghost = document.createElement("img");
  ghost.className = `drag-ghost piece piece-${square.piece.color}`;
  ghost.width = 56;
  ghost.height = 56;
  ghost.src = sprite;
  ghost.draggable = false;
  ghost.style.position = "absolute";
  ghost.style.top = "-9999px";
  ghost.style.left = "-9999px";
  const filter =
    square.piece.color === "white"
      ? "brightness(0) invert(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))"
      : "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))";
  ghost.style.filter = filter;
  ghost.style.webkitFilter = filter;
  document.body.appendChild(ghost);

  const target = event.target as HTMLElement;
  const cleanup = (): void => {
    if (ghost.parentElement) {
      ghost.parentElement.removeChild(ghost);
    }
  };

  const applyDragImage = (): void => {
    event.dataTransfer.setDragImage(ghost, 28, 28);
  };

  if (ghost.complete) {
    applyDragImage();
  } else {
    ghost.onload = applyDragImage;
  }

  target.addEventListener("dragend", cleanup, { once: true });
}

export function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

export function createHandleDrop(context: DropContext): (event: React.DragEvent<HTMLDivElement>, target: SquareView) => void {
  return (event, target) => {
    if (!context.isHumanTurn) {
      return;
    }
    event.preventDefault();
    const payload = event.dataTransfer.getData("application/x-chess-from");
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
