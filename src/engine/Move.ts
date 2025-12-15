import { BoardState } from "./board/BoardState";
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

export function formatStandardAlgebraic(
  move: Move,
  movingPiece: Piece,
  state: BoardState,
  legalMoves: Move[],
  isCheck: boolean,
  isMate: boolean
): string {
  if (move.isCastle) {
    const base = move.isCastle === "kingside" ? "O-O" : "O-O-O";
    return `${base}${notationSuffix(isCheck, isMate)}`;
  }

  if (movingPiece.type === "pawn") {
    const originFile = move.isCapture ? fileChar(move.from.file) : "";
    const promotionText = move.promotion ? `=${promotionLetter(move.promotion)}` : "";
    const captureMark = move.isCapture ? "x" : "";
    return `${originFile}${captureMark}${toAlgebraic(move.to)}${promotionText}${notationSuffix(isCheck, isMate)}`;
  }

  const pieceMark = pieceLetter(movingPiece.type);
  const disambiguation = disambiguate(move, movingPiece, state, legalMoves);
  const captureMark = move.isCapture ? "x" : "";
  const promotionText = move.promotion ? `=${promotionLetter(move.promotion)}` : "";
  return `${pieceMark}${disambiguation}${captureMark}${toAlgebraic(move.to)}${promotionText}${notationSuffix(isCheck, isMate)}`;
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

function pieceLetter(type: PieceType): string {
  switch (type) {
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "rook":
      return "R";
    case "bishop":
      return "B";
    case "knight":
      return "N";
    case "pawn":
    default:
      return "";
  }
}

function fileChar(file: number): string {
  return String.fromCharCode("a".charCodeAt(0) + file);
}

function rankChar(rank: number): string {
  return (rank + 1).toString();
}

function disambiguate(move: Move, movingPiece: Piece, state: BoardState, legalMoves: Move[]): string {
  if (movingPiece.type === "pawn") {
    return "";
  }

  const similar = legalMoves.filter((candidate) => {
    if (candidate.from.file === move.from.file && candidate.from.rank === move.from.rank) {
      return false;
    }
    if (candidate.to.file !== move.to.file || candidate.to.rank !== move.to.rank) {
      return false;
    }
    const candidatePiece = state.getPiece(candidate.from);
    return Boolean(candidatePiece && candidatePiece.type === movingPiece.type && candidatePiece.color === movingPiece.color);
  });

  if (similar.length === 0) {
    return "";
  }

  const sameFile = similar.some((candidate) => candidate.from.file === move.from.file);
  const sameRank = similar.some((candidate) => candidate.from.rank === move.from.rank);

  if (!sameFile) {
    return fileChar(move.from.file);
  }
  if (!sameRank) {
    return rankChar(move.from.rank);
  }
  return `${fileChar(move.from.file)}${rankChar(move.from.rank)}`;
}
