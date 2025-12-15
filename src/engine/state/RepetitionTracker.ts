import { BoardState, CastlingRights } from "../board/BoardState";
import { Piece } from "../Piece";
import { toAlgebraic } from "../board/Square";

export interface RecordedKey {
  readonly key: string;
  readonly count: number;
}

export class RepetitionTracker {
  private keyHistory: string[];
  private counts: Map<string, number>;

  constructor(initialState: BoardState) {
    this.keyHistory = [];
    this.counts = new Map();
    this.record(initialState);
  }

  record(state: BoardState): RecordedKey {
    const key = createRepetitionKey(state);
    this.keyHistory.push(key);
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    return { key, count };
  }

  undo(): void {
    const key = this.keyHistory.pop();
    if (!key) {
      return;
    }
    const current = this.counts.get(key) ?? 0;
    if (current <= 1) {
      this.counts.delete(key);
      return;
    }
    this.counts.set(key, current - 1);
  }

  reset(state: BoardState): void {
    this.keyHistory = [];
    this.counts = new Map();
    this.record(state);
  }
}

export function createRepetitionKey(state: BoardState): string {
  const placement = placementString(state);
  const active = state.meta.activeColor === "white" ? "w" : "b";
  const castling = castlingString(state.meta.castling);
  const enPassant = state.meta.enPassantTarget ? toAlgebraic(state.meta.enPassantTarget) : "-";
  return `${placement} ${active} ${castling} ${enPassant}`;
}

function placementString(state: BoardState): string {
  const pieces = state.snapshot();
  const ranks: string[] = [];
  for (let rank = 7; rank >= 0; rank -= 1) {
    let line = "";
    let empty = 0;
    for (let file = 0; file < 8; file += 1) {
      const piece = pieces[rank * 8 + file];
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        line += empty.toString();
        empty = 0;
      }
      line += pieceLetter(piece);
    }
    if (empty > 0) {
      line += empty.toString();
    }
    ranks.push(line);
  }
  return ranks.join("/");
}

function castlingString(rights: CastlingRights): string {
  const parts: string[] = [];
  if (rights.whiteKingSide) {
    parts.push("K");
  }
  if (rights.whiteQueenSide) {
    parts.push("Q");
  }
  if (rights.blackKingSide) {
    parts.push("k");
  }
  if (rights.blackQueenSide) {
    parts.push("q");
  }
  return parts.length === 0 ? "-" : parts.join("");
}

function pieceLetter(piece: Piece): string {
  switch (piece.type) {
    case "pawn":
      return piece.color === "white" ? "P" : "p";
    case "knight":
      return piece.color === "white" ? "N" : "n";
    case "bishop":
      return piece.color === "white" ? "B" : "b";
    case "rook":
      return piece.color === "white" ? "R" : "r";
    case "queen":
      return piece.color === "white" ? "Q" : "q";
    case "king":
      return piece.color === "white" ? "K" : "k";
    default:
      return "";
  }
}
