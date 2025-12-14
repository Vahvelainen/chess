import { BoardState, CastlingRights } from "../board/BoardState";
import { Square, createSquare, isInsideBoard } from "../board/Square";
import { Move } from "../Move";
import { Color, Piece } from "../Piece";
import { isSquareAttacked } from "./Attack";

export function knightMoves(piece: Piece, square: Square, state: BoardState): Move[] {
  const deltas = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2]
  ];
  const moves: Move[] = [];
  for (const [df, dr] of deltas) {
    const target = createSquare(square.file + df, square.rank + dr);
    if (!isInsideBoard(target)) {
      continue;
    }
    const occupant = state.getPiece(target);
    if (!occupant || occupant.color !== piece.color) {
      moves.push({ from: square, to: target, isCapture: Boolean(occupant) });
    }
  }
  return moves;
}

export function slidingMoves(piece: Piece, square: Square, state: BoardState, directions: Array<[number, number]>): Move[] {
  const moves: Move[] = [];
  for (const [df, dr] of directions) {
    let file = square.file + df;
    let rank = square.rank + dr;
    while (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      const target = createSquare(file, rank);
      const occupant = state.getPiece(target);
      if (!occupant) {
        moves.push({ from: square, to: target });
      } else {
        if (occupant.color !== piece.color) {
          moves.push({ from: square, to: target, isCapture: true });
        }
        break;
      }
      file += df;
      rank += dr;
    }
  }
  return moves;
}

export function kingMoves(piece: Piece, square: Square, state: BoardState): Move[] {
  const moves: Move[] = [];
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      if (df === 0 && dr === 0) {
        continue;
      }
      const target = createSquare(square.file + df, square.rank + dr);
      if (!isInsideBoard(target)) {
        continue;
      }
      const occupant = state.getPiece(target);
      if (!occupant || occupant.color !== piece.color) {
        moves.push({ from: square, to: target, isCapture: Boolean(occupant) });
      }
    }
  }
  moves.push(...castleMoves(piece.color, state));
  return moves;
}

function castleMoves(color: Color, state: BoardState): Move[] {
  const rights = state.meta.castling;
  const moves: Move[] = [];
  const rank = color === "white" ? 0 : 7;
  const kingSquare = createSquare(4, rank);
  const king = state.getPiece(kingSquare);
  if (!king || king.type !== "king") {
    return moves;
  }
  if (rightsFor(color, rights).kingSide && castlePathClear(state, rank, 5, 6, color)) {
    moves.push({ from: kingSquare, to: createSquare(6, rank), isCastle: "kingside" });
  }
  if (rightsFor(color, rights).queenSide && castlePathClear(state, rank, 3, 2, color)) {
    moves.push({ from: kingSquare, to: createSquare(2, rank), isCastle: "queenside" });
  }
  return moves;
}

function castlePathClear(state: BoardState, rank: number, fileThrough: number, fileTo: number, color: Color): boolean {
  const step = fileThrough < 4 ? -1 : 1;
  for (let file = 4 + step; file !== fileTo + step; file += step) {
    const square = createSquare(file, rank);
    if (state.getPiece(square)) {
      return false;
    }
  }
  const throughSquare = createSquare(fileThrough, rank);
  const toSquare = createSquare(fileTo, rank);
  return !isSquareAttacked(state, createSquare(4, rank), opposite(color)) && !isSquareAttacked(state, throughSquare, opposite(color)) && !isSquareAttacked(state, toSquare, opposite(color));
}

function rightsFor(color: Color, rights: CastlingRights): { kingSide: boolean; queenSide: boolean } {
  return color === "white"
    ? { kingSide: rights.whiteKingSide, queenSide: rights.whiteQueenSide }
    : { kingSide: rights.blackKingSide, queenSide: rights.blackQueenSide };
}

function opposite(color: Color): Color {
  return color === "white" ? "black" : "white";
}
