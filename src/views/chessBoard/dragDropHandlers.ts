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

export function handleDragStart(event: React.DragEvent<HTMLDivElement>, square: SquareView): void {
  if (!square.piece) {
    return;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-chess-from", JSON.stringify({ file: square.file, rank: square.rank }));
  const ghost = document.createElement("img");
  ghost.className = `drag-ghost piece piece-${square.piece.color}`;
  ghost.width = 56;
  ghost.height = 56;
  ghost.src = pieceSprite(square.piece);
  if (square.piece.color === "white") {
    ghost.style.filter = "invert(1)";
  }
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, 28, 28);
  setTimeout(() => {
    document.body.removeChild(ghost);
  }, 0);
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
  };
}
