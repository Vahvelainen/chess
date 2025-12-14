import { Color, Piece, PieceType, createPiece } from "../Piece";
import { Square, fromAlgebraic, isInsideBoard } from "./Square";

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface StateMeta {
  activeColor: Color;
  castling: CastlingRights;
  enPassantTarget?: Square;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export class BoardState {
  private readonly squares: Array<Piece | undefined>;
  readonly meta: StateMeta;

  constructor(squares: Array<Piece | undefined>, meta: StateMeta) {
    this.squares = squares;
    this.meta = meta;
  }

  static initial(): BoardState {
    return BoardState.fromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }

  static fromFEN(fen: string): BoardState {
    const [placement, active, castling, enPassant, halfmove, fullmove] = fen.split(" ");
    const squares: Array<Piece | undefined> = new Array(64).fill(undefined);
    const rows = placement.split("/");
    rows.forEach((row, rowIndex) => {
      let file = 0;
      for (const char of row) {
        if (Number.isInteger(Number.parseInt(char, 10))) {
          file += Number.parseInt(char, 10);
          continue;
        }
        const color: Color = char === char.toUpperCase() ? "white" : "black";
        const type = BoardState.toPieceType(char.toLowerCase());
        const rank = 7 - rowIndex;
        const squareIndex = rank * 8 + file;
        squares[squareIndex] = createPiece(type, color);
        file += 1;
      }
    });

    const meta: StateMeta = {
      activeColor: active === "w" ? "white" : "black",
      castling: BoardState.parseCastling(castling),
      enPassantTarget: enPassant === "-" ? undefined : fromAlgebraic(enPassant),
      halfmoveClock: Number.parseInt(halfmove, 10) || 0,
      fullmoveNumber: Number.parseInt(fullmove, 10) || 1
    };
    return new BoardState(squares, meta);
  }

  cloneWithMeta(meta: StateMeta): BoardState {
    const clonedSquares = this.squares.map((piece) => (piece ? { ...piece } : undefined));
    return new BoardState(clonedSquares, meta);
  }

  getPiece(square: Square): Piece | undefined {
    if (!isInsideBoard(square)) {
      return undefined;
    }
    return this.squares[square.rank * 8 + square.file];
  }

  setPiece(square: Square, piece: Piece | undefined): BoardState {
    const nextSquares = this.squares.slice();
    nextSquares[square.rank * 8 + square.file] = piece;
    return new BoardState(nextSquares, this.meta);
  }

  snapshot(): Array<Piece | undefined> {
    return this.squares.map((piece) => (piece ? { ...piece } : undefined));
  }

  private static toPieceType(letter: string): PieceType {
    switch (letter) {
      case "p":
        return "pawn";
      case "n":
        return "knight";
      case "b":
        return "bishop";
      case "r":
        return "rook";
      case "q":
        return "queen";
      case "k":
        return "king";
      default:
        throw new Error(`Unknown piece letter: ${letter}`);
    }
  }

  private static parseCastling(value: string): CastlingRights {
    return {
      whiteKingSide: value.includes("K"),
      whiteQueenSide: value.includes("Q"),
      blackKingSide: value.includes("k"),
      blackQueenSide: value.includes("q")
    };
  }
}
