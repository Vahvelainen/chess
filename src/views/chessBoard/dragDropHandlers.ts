import React from "react";
import { ChessGame } from "../../engine/ChessGame";
import { createSquare, Square } from "../../engine/board/Square";
import { pieceSprite } from "./pieceHelpers";
import { PromotionRequest } from "./useChessGameController";
import { SquareView } from "./boardLayoutHelpers";

export interface DropContext {
  readonly isHumanTurn: boolean;
  readonly game: ChessGame;
  readonly setError: (error: string | undefined) => void;
  readonly setPendingPromotion: (request: PromotionRequest | undefined) => void;
  readonly refresh: () => void;
}

function createGhostElement(piece: SquareView["piece"] | undefined): HTMLImageElement | undefined {
  if (!piece) {
    return undefined;
  }
  const ghost = document.createElement("img");
  ghost.className = `touch-ghost piece piece-${piece.color}`;
  ghost.width = 56;
  ghost.height = 56;
  ghost.src = pieceSprite(piece);
  ghost.style.width = "56px";
  ghost.style.height = "56px";
  ghost.style.maxWidth = "56px";
  ghost.style.maxHeight = "56px";
  ghost.draggable = false;
  ghost.style.position = "fixed";
  ghost.style.pointerEvents = "none";
  ghost.style.transform = "translate(-50%, -50%)";
  ghost.style.zIndex = "9999";
  const filter =
    piece.color === "white"
      ? "brightness(0) invert(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))"
      : "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))";
  ghost.style.filter = filter;
  ghost.style.webkitFilter = filter;
  ghost.style.left = "-9999px";
  ghost.style.top = "-9999px";
  document.body.appendChild(ghost);
  return ghost;
}

function updateGhostPosition(ghost: HTMLImageElement | undefined, x: number, y: number): void {
  if (!ghost) {
    return;
  }
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
}

function playMove(context: DropContext, from: Square, to: Square): void {
  if (from.file === to.file && from.rank === to.rank) {
    return;
  }
  const movingPiece = context.game.getBoard().getPiece(from);
  if (movingPiece?.type === "pawn" && (to.rank === 7 || to.rank === 0)) {
    context.setPendingPromotion({ from, to, color: movingPiece.color });
    context.setError(undefined);
    return;
  }
  const result = context.game.playMove({ from, to });
  if (result.success) {
    context.refresh();
    context.setError(undefined);
    return;
  }
  if (result.error) {
    context.setError(result.error);
  }
}

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
    let from: Square | undefined;
    try {
      const parsed = JSON.parse(payload) as { file: number; rank: number };
      from = createSquare(parsed.file, parsed.rank);
    } catch (e) {
      context.setError("Could not parse move");
      return;
    }
    const to = createSquare(target.file, target.rank);
    playMove(context, from, to);
  };
}

function resolveSquareFromElement(element: Element | null): Square | undefined {
  const squareElement = (element as HTMLElement | null)?.closest(".square") as HTMLElement | null;
  if (!squareElement) {
    return undefined;
  }
  const file = squareElement.dataset.file;
  const rank = squareElement.dataset.rank;
  if (file === undefined || rank === undefined) {
    return undefined;
  }
  const parsedFile = Number.parseInt(file, 10);
  const parsedRank = Number.parseInt(rank, 10);
  if (Number.isNaN(parsedFile) || Number.isNaN(parsedRank)) {
    return undefined;
  }
  return createSquare(parsedFile, parsedRank);
}

function findTouchById(list: TouchList, identifier: number | undefined): Touch | undefined {
  if (identifier === undefined) {
    return list.length > 0 ? list.item(0) ?? undefined : undefined;
  }
  for (let index = 0; index < list.length; index += 1) {
    const touch = list.item(index);
    if (touch?.identifier === identifier) {
      return touch;
    }
  }
  return undefined;
}

export function createTouchHandlers(context: DropContext): {
  readonly handleTouchStart: (event: React.TouchEvent<HTMLDivElement>, square: SquareView) => void;
  readonly handleTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  readonly handleTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  readonly handleTouchCancel: (event: React.TouchEvent<HTMLDivElement>) => void;
} {
  let activeTouchId: number | undefined;
  let fromSquare: Square | undefined;
  let lastPoint: { x: number; y: number } | undefined;
  let ghost: HTMLImageElement | undefined;

  function resetTouch(): void {
    activeTouchId = undefined;
    fromSquare = undefined;
    lastPoint = undefined;
    if (ghost?.parentElement) {
      ghost.parentElement.removeChild(ghost);
    }
    ghost = undefined;
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>, square: SquareView): void => {
    if (!context.isHumanTurn || !square.piece || square.piece.color !== context.game.getActiveColor()) {
      resetTouch();
      return;
    }
    const touch = event.touches[0];
    activeTouchId = touch?.identifier;
    if (touch) {
      lastPoint = { x: touch.clientX, y: touch.clientY };
    }
    ghost = createGhostElement(square.piece);
    if (ghost && touch) {
      updateGhostPosition(ghost, touch.clientX, touch.clientY);
    }
    fromSquare = createSquare(square.file, square.rank);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>): void => {
    if (!fromSquare) {
      return;
    }
    const touch = findTouchById(event.touches, activeTouchId);
    if (touch) {
      lastPoint = { x: touch.clientX, y: touch.clientY };
      updateGhostPosition(ghost, touch.clientX, touch.clientY);
      event.preventDefault();
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>): void => {
    if (!fromSquare) {
      return;
    }
    const touch = findTouchById(event.changedTouches, activeTouchId);
    const point = touch ? { x: touch.clientX, y: touch.clientY } : lastPoint;
    const from = fromSquare;
    if (ghost?.parentElement) {
      ghost.parentElement.removeChild(ghost);
    }
    ghost = undefined;
    activeTouchId = undefined;
    fromSquare = undefined;
    lastPoint = undefined;
    if (!point) {
      return;
    }
    const element = document.elementFromPoint(point.x, point.y);
    const to = resolveSquareFromElement(element);
    if (!to) {
      return;
    }
    playMove(context, from, to);
  };

  const handleTouchCancel = (_event: React.TouchEvent<HTMLDivElement>): void => {
    resetTouch();
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel };
}
