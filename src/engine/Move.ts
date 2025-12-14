import { Piece, PieceType } from "./Piece";
import { Square, toAlgebraic } from "./board/Square";

export interface Move {
  readonly from: Square;
  readonly to: Square;
  readonly promotion?: PieceType;
  readonly isCapture?: boolean;
  readonly isCastle?: "kingside" | "queenside";
  readonly isEnPassant?: boolean;
}

export interface MoveRecord {
  readonly move: Move;
  readonly notation: string;
}

export function formatLongAlgebraic(move: Move, movingPiece: Piece, isCheck: boolean, isMate: boolean): string {
  if (move.isCastle) {
    const base = move.isCastle === "kingside" ? "O-O" : "O-O-O";
    return `${base}${notationSuffix(isCheck, isMate)}`;
  }
  const captureMark = move.isCapture ? "x" : "";
  const promotionText = move.promotion ? `=${promotionLetter(move.promotion)}` : "";
  const base = `${toAlgebraic(move.from)}${captureMark}${toAlgebraic(move.to)}${promotionText}`;
  return `${base}${notationSuffix(isCheck, isMate)}`;
}

function promotionLetter(type: PieceType): string {
  switch (type) {
    case "queen":
      return "Q";
    case "rook":
      return "R";
    case "bishop":
      return "B";
    case "knight":
      return "N";
    default:
      return "";
  }
}

function notationSuffix(isCheck: boolean, isMate: boolean): string {
  if (isMate) {
    return "#";
  }
  if (isCheck) {
    return "+";
  }
  return "";
}
