import { ChessGame } from "../../../engine/ChessGame";
import { createSquare, Square } from "../../../engine/board/Square";
import { PromotionRequest } from "../useChessGameController";
import { SquareView } from "../boardLayoutHelpers";
import { GameEndStatus } from "../../../engine/Move";

export interface DropContext {
  readonly isHumanTurn: boolean;
  readonly game: ChessGame;
  readonly setError: (error: string | undefined) => void;
  readonly setEndStatus: (status: GameEndStatus | undefined) => void;
  readonly setPendingPromotion: (request: PromotionRequest | undefined) => void;
  readonly refresh: () => void;
}

export function playMove(context: DropContext, from: Square, to: Square): void {
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
    context.setEndStatus(result.endStatus);
    return;
  }
  if (result.error) {
    context.setError(result.error);
  }
  context.setEndStatus(undefined);
}

export function resolveSquareFromElement(element: Element | null): Square | undefined {
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

export function parseDragFromPayload(payload: string): Square | undefined {
  try {
    const parsed = JSON.parse(payload) as { file: number; rank: number };
    return createSquare(parsed.file, parsed.rank);
  } catch (error) {
    return undefined;
  }
}

export function createSquareFromView(target: SquareView): Square {
  return createSquare(target.file, target.rank);
}
