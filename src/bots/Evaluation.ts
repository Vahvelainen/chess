import { BoardState } from "../engine/board/BoardState";
import { Color, Piece, PieceType } from "../engine/Piece";

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000000
};

export function pieceValue(piece: Piece): number {
  return PIECE_VALUES[piece.type];
}

export function materialScore(state: BoardState, perspective: Color): number {
  const snapshot = state.snapshot();
  let score = 0;
  for (const piece of snapshot) {
    if (!piece) {
      continue;
    }
    const value = pieceValue(piece);
    score += piece.color === perspective ? value : -value;
  }
  return score;
}
