import React from "react";
import { createSquare } from "../../../engine/board/Square";
import { SquareView } from "../boardLayoutHelpers";
import { createGhostElement, updateGhostPosition } from "./ghost";
import { DropContext, playMove, resolveSquareFromElement } from "./shared";

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
  let fromSquare: { file: number; rank: number } | undefined;
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
    fromSquare = { file: square.file, rank: square.rank };
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
    const from = createSquare(fromSquare.file, fromSquare.rank);
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
