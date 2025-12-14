export type Color = "white" | "black";

export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export interface Piece {
  readonly type: PieceType;
  readonly color: Color;
}

export function createPiece(type: PieceType, color: Color): Piece {
  return { type, color };
}

export function oppositeColor(color: Color): Color {
  return color === "white" ? "black" : "white";
}

export function pieceLetter(piece: Piece): string {
  const letters: Record<PieceType, string> = {
    pawn: "p",
    knight: "n",
    bishop: "b",
    rook: "r",
    queen: "q",
    king: "k"
  };
  const base = letters[piece.type];
  return piece.color === "white" ? base.toUpperCase() : base;
}
