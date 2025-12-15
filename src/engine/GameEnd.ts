import { GameEndStatus } from "./Move";
import { Piece } from "./Piece";

export interface EndStatusInput {
  readonly isMate: boolean;
  readonly inCheck: boolean;
  readonly noLegalMoves: boolean;
  readonly movingPiece: Piece;
  readonly repetitionCount: number;
}

export function computeEndStatus(input: EndStatusInput): GameEndStatus | undefined {
  if (input.isMate) {
    return { type: "checkmate", winner: input.movingPiece.color };
  }
  if (input.noLegalMoves && !input.inCheck) {
    return { type: "stalemate" };
  }
  if (input.repetitionCount >= 3) {
    return { type: "threefold-repetition" };
  }
  return undefined;
}
