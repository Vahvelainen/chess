import { BoardState } from "../engine/board/BoardState";
import { Color, Piece, PieceType } from "../engine/Piece";
import { Square, createSquare } from "../engine/board/Square";

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0 // Handled via checkmate detection
};

const INNER_CENTER_BONUS = 0.2; // d4, d5, e4, e5
const OUTER_CENTER_BONUS = 0.1; // c3-f6 excluding inner
const CASTLING_RIGHT_BONUS = 0.15;
const CASTLED_BONUS = 0.15; // Bonus for having castled

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

function isInnerCenter(square: Square): boolean {
  // d4, d5, e4, e5 = files 3-4, ranks 3-4
  return square.file >= 3 && square.file <= 4 && square.rank >= 3 && square.rank <= 4;
}

function isOuterCenter(square: Square): boolean {
  // c3-f6 = files 2-5, ranks 2-5, excluding inner
  return (
    square.file >= 2 &&
    square.file <= 5 &&
    square.rank >= 2 &&
    square.rank <= 5 &&
    !isInnerCenter(square)
  );
}

export function centerControlScore(state: BoardState, perspective: Color): number {
  let score = 0;
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const square = createSquare(file, rank);
      const piece = state.getPiece(square);
      if (!piece) {
        continue;
      }
      let bonus = 0;
      if (isInnerCenter(square)) {
        bonus = INNER_CENTER_BONUS;
      } else if (isOuterCenter(square)) {
        bonus = OUTER_CENTER_BONUS;
      }
      if (bonus > 0) {
        score += piece.color === perspective ? bonus : -bonus;
      }
    }
  }
  return score;
}

function isCastledPosition(square: Square, color: Color): boolean {
  // White castled positions: g1 (kingside) or c1 (queenside)
  // Black castled positions: g8 (kingside) or c8 (queenside)
  if (color === "white") {
    return (square.file === 6 && square.rank === 0) || (square.file === 2 && square.rank === 0);
  } else {
    return (square.file === 6 && square.rank === 7) || (square.file === 2 && square.rank === 7);
  }
}

export function castlingRightsScore(state: BoardState, perspective: Color): number {
  let score = 0;
  const castling = state.meta.castling;
  
  // Our castling rights are positive (prefer to retain them)
  const ourRights = perspective === "white" 
    ? { kingSide: castling.whiteKingSide, queenSide: castling.whiteQueenSide }
    : { kingSide: castling.blackKingSide, queenSide: castling.blackQueenSide };
  
  if (ourRights.kingSide) {
    score += CASTLING_RIGHT_BONUS;
  }
  if (ourRights.queenSide) {
    score += CASTLING_RIGHT_BONUS;
  }
  
  // Opponent's castling rights are negative from our perspective
  const opponentRights = perspective === "white"
    ? { kingSide: castling.blackKingSide, queenSide: castling.blackQueenSide }
    : { kingSide: castling.whiteKingSide, queenSide: castling.whiteQueenSide };
  
  if (opponentRights.kingSide) {
    score -= CASTLING_RIGHT_BONUS;
  }
  if (opponentRights.queenSide) {
    score -= CASTLING_RIGHT_BONUS;
  }
  
  return score;
}

export function castledPositionScore(state: BoardState, perspective: Color): number {
  let score = 0;
  
  // Check if kings are in castled positions
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const square = createSquare(file, rank);
      const piece = state.getPiece(square);
      if (piece && piece.type === "king") {
        if (isCastledPosition(square, piece.color)) {
          if (piece.color === perspective) {
            score += CASTLED_BONUS;
          } else {
            score -= CASTLED_BONUS;
          }
        }
      }
    }
  }
  
  return score;
}

export function castlingScore(state: BoardState, perspective: Color): number {
  return castlingRightsScore(state, perspective) + castledPositionScore(state, perspective);
}

export function evaluate(state: BoardState, perspective: Color): number {
  return (
    materialScore(state, perspective) +
    centerControlScore(state, perspective) +
    castlingScore(state, perspective)
  );
}
