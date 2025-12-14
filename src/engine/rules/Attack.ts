import { BoardState } from "../board/BoardState";
import { Square, createSquare } from "../board/Square";
import { Color, Piece } from "../Piece";

export function isKingInCheck(state: BoardState, color: Color): boolean {
  const kingSquare = findKing(state, color);
  return Boolean(kingSquare && isSquareAttacked(state, kingSquare, opposite(color)));
}

export function isSquareAttacked(state: BoardState, target: Square, byColor: Color): boolean {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const square = createSquare(file, rank);
      const piece = state.getPiece(square);
      if (!piece || piece.color !== byColor) {
        continue;
      }
      if (attacksSquare(piece, square, target, state)) {
        return true;
      }
    }
  }
  return false;
}

function attacksSquare(piece: Piece, from: Square, target: Square, state: BoardState): boolean {
  const rankDelta = target.rank - from.rank;
  const fileDelta = target.file - from.file;
  switch (piece.type) {
    case "pawn": {
      const dir = piece.color === "white" ? 1 : -1;
      return rankDelta === dir && Math.abs(fileDelta) === 1;
    }
    case "knight":
      return (Math.abs(rankDelta) === 2 && Math.abs(fileDelta) === 1) || (Math.abs(rankDelta) === 1 && Math.abs(fileDelta) === 2);
    case "bishop":
      return Math.abs(rankDelta) === Math.abs(fileDelta) && clearPath(state, from, target, fileDelta, rankDelta);
    case "rook":
      return (rankDelta === 0 || fileDelta === 0) && clearPath(state, from, target, fileDelta, rankDelta);
    case "queen":
      return (Math.abs(rankDelta) === Math.abs(fileDelta) || rankDelta === 0 || fileDelta === 0) && clearPath(state, from, target, fileDelta, rankDelta);
    case "king":
      return Math.max(Math.abs(rankDelta), Math.abs(fileDelta)) === 1;
    default:
      return false;
  }
}

function clearPath(state: BoardState, from: Square, target: Square, fileDelta: number, rankDelta: number): boolean {
  const fileStep = fileDelta === 0 ? 0 : fileDelta / Math.abs(fileDelta);
  const rankStep = rankDelta === 0 ? 0 : rankDelta / Math.abs(rankDelta);
  let file = from.file + fileStep;
  let rank = from.rank + rankStep;
  while (file !== target.file || rank !== target.rank) {
    if (state.getPiece(createSquare(file, rank))) {
      return false;
    }
    file += fileStep;
    rank += rankStep;
  }
  return true;
}

function findKing(state: BoardState, color: Color): Square | undefined {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const square = createSquare(file, rank);
      const piece = state.getPiece(square);
      if (piece && piece.type === "king" && piece.color === color) {
        return square;
      }
    }
  }
  return undefined;
}

function opposite(color: Color): Color {
  return color === "white" ? "black" : "white";
}
