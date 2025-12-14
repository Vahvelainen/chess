import { BoardState } from "../board/BoardState";
import { Square, createSquare, isInsideBoard } from "../board/Square";
import { Move } from "../Move";
import { Piece, PieceType } from "../Piece";

export function pawnMoves(piece: Piece, square: Square, state: BoardState): Move[] {
  const direction = piece.color === "white" ? 1 : -1;
  const startRank = piece.color === "white" ? 1 : 6;
  const moves: Move[] = [];
  const oneStep = createSquare(square.file, square.rank + direction);
  if (isInsideBoard(oneStep) && !state.getPiece(oneStep)) {
    addPawnMove(moves, piece, square, oneStep);
    const twoStep = createSquare(square.file, square.rank + direction * 2);
    if (square.rank === startRank && !state.getPiece(twoStep)) {
      moves.push({ from: square, to: twoStep });
    }
  }
  for (const fileDelta of [-1, 1]) {
    const target = createSquare(square.file + fileDelta, square.rank + direction);
    if (!isInsideBoard(target)) {
      continue;
    }
    const occupant = state.getPiece(target);
    if (occupant && occupant.color !== piece.color) {
      addPawnMove(moves, piece, square, target, true);
    } else if (state.meta.enPassantTarget && target.file === state.meta.enPassantTarget.file && target.rank === state.meta.enPassantTarget.rank) {
      moves.push({ from: square, to: target, isCapture: true, isEnPassant: true });
    }
  }
  return moves;
}

function addPawnMove(list: Move[], piece: Piece, from: Square, to: Square, isCapture = false): void {
  const promotionRank = piece.color === "white" ? 7 : 0;
  if (to.rank === promotionRank) {
    ["queen", "rook", "bishop", "knight"].forEach((type) => {
      list.push({ from, to, promotion: type as PieceType, isCapture });
    });
    return;
  }
  list.push({ from, to, isCapture });
}
