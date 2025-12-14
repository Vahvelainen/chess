import { BoardState } from "../board/BoardState";
import { Square, createSquare } from "../board/Square";
import { Move } from "../Move";
import { Color, Piece, oppositeColor } from "../Piece";
import { isKingInCheck } from "./Attack";
import { pawnMoves } from "./PawnRules";
import { kingMoves, knightMoves, slidingMoves } from "./Movement";
import { applyMove } from "./StateTransitions";

export function generateLegalMoves(state: BoardState): Move[] {
  const pseudo: Move[] = [];
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const square = createSquare(file, rank);
      const piece = state.getPiece(square);
      if (!piece || piece.color !== state.meta.activeColor) {
        continue;
      }
      pseudo.push(...pseudoMovesForPiece(piece, square, state));
    }
  }
  return pseudo.filter((move) => !leavesKingInCheck(state, move));
}

function pseudoMovesForPiece(piece: Piece, square: Square, state: BoardState): Move[] {
  switch (piece.type) {
    case "pawn":
      return pawnMoves(piece, square, state);
    case "knight":
      return knightMoves(piece, square, state);
    case "bishop":
      return slidingMoves(piece, square, state, [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ]);
    case "rook":
      return slidingMoves(piece, square, state, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]);
    case "queen":
      return slidingMoves(piece, square, state, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ]);
    case "king":
      return kingMoves(piece, square, state);
    default:
      return [];
  }
}

function leavesKingInCheck(state: BoardState, move: Move): boolean {
  const next = applyMove(state, move);
  return isKingInCheck(next, oppositeColor(next.meta.activeColor));
}
