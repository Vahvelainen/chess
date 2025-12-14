import { BoardState, CastlingRights, StateMeta } from "../board/BoardState";
import { Square, createSquare } from "../board/Square";
import { Move } from "../Move";
import { Color, Piece, createPiece, oppositeColor } from "../Piece";

export function applyMove(state: BoardState, move: Move): BoardState {
  const movingPiece = state.getPiece(move.from);
  if (!movingPiece) {
    throw new Error("No piece on source square");
  }
  const nextMeta = advanceMeta(state, move, movingPiece);
  const squares = state.snapshot();
  const fromIndex = move.from.rank * 8 + move.from.file;
  const toIndex = move.to.rank * 8 + move.to.file;

  squares[fromIndex] = undefined;
  if (move.isEnPassant) {
    const direction = movingPiece.color === "white" ? 1 : -1;
    const captureRank = move.to.rank - direction;
    squares[captureRank * 8 + move.to.file] = undefined;
  }
  if (move.isCastle) {
    const isKingSide = move.isCastle === "kingside";
    const rookFromFile = isKingSide ? 7 : 0;
    const rookToFile = isKingSide ? 5 : 3;
    const rookRank = movingPiece.color === "white" ? 0 : 7;
    const rookFromIndex = rookRank * 8 + rookFromFile;
    const rookToIndex = rookRank * 8 + rookToFile;
    squares[rookFromIndex] = undefined;
    squares[rookToIndex] = createPiece("rook", movingPiece.color);
  }

  const placedPiece = move.promotion ? createPiece(move.promotion, movingPiece.color) : movingPiece;
  squares[toIndex] = placedPiece;

  return new BoardState(squares, nextMeta);
}

export function advanceMeta(state: BoardState, move: Move, piece: Piece): StateMeta {
  const castling = updateCastlingRights(state, move, piece);
  const halfmoveClock = piece.type === "pawn" || move.isCapture ? 0 : state.meta.halfmoveClock + 1;
  const enPassantTarget = computeEnPassantTarget(piece, move);
  const fullmoveNumber = piece.color === "black" ? state.meta.fullmoveNumber + 1 : state.meta.fullmoveNumber;
  return {
    activeColor: oppositeColor(state.meta.activeColor),
    castling,
    enPassantTarget,
    halfmoveClock,
    fullmoveNumber
  };
}

export function computeEnPassantTarget(piece: Piece, move: Move): Square | undefined {
  if (piece.type !== "pawn") {
    return undefined;
  }
  const rankDiff = move.to.rank - move.from.rank;
  if (Math.abs(rankDiff) !== 2) {
    return undefined;
  }
  const midRank = move.from.rank + rankDiff / 2;
  return createSquare(move.from.file, midRank);
}

export function updateCastlingRights(state: BoardState, move: Move, piece: Piece): CastlingRights {
  const rights = { ...state.meta.castling };
  if (piece.type === "king") {
    if (piece.color === "white") {
      rights.whiteKingSide = false;
      rights.whiteQueenSide = false;
    } else {
      rights.blackKingSide = false;
      rights.blackQueenSide = false;
    }
  }
  if (piece.type === "rook") {
    adjustRightsForRookMove(rights, move, piece.color);
  }
  const captured = state.getPiece(move.to);
  if (captured && captured.type === "rook") {
    adjustRightsForCapturedRook(rights, move.to, captured.color);
  }
  return rights;
}

function adjustRightsForRookMove(rights: CastlingRights, move: Move, color: Color): void {
  if (color === "white" && move.from.rank === 0) {
    if (move.from.file === 0) {
      rights.whiteQueenSide = false;
    } else if (move.from.file === 7) {
      rights.whiteKingSide = false;
    }
  }
  if (color === "black" && move.from.rank === 7) {
    if (move.from.file === 0) {
      rights.blackQueenSide = false;
    } else if (move.from.file === 7) {
      rights.blackKingSide = false;
    }
  }
}

function adjustRightsForCapturedRook(rights: CastlingRights, square: Square, color: Color): void {
  if (color === "white" && square.rank === 0) {
    if (square.file === 0) {
      rights.whiteQueenSide = false;
    } else if (square.file === 7) {
      rights.whiteKingSide = false;
    }
  }
  if (color === "black" && square.rank === 7) {
    if (square.file === 0) {
      rights.blackQueenSide = false;
    } else if (square.file === 7) {
      rights.blackKingSide = false;
    }
  }
}
