import { Piece } from "../../engine/Piece";

const pieceLetters: Record<Piece["type"], string> = {
  pawn: "P",
  knight: "N",
  bishop: "B",
  rook: "R",
  queen: "Q",
  king: "K"
};

export function pieceLabel(piece: Piece): string {
  return pieceLetters[piece.type];
}
