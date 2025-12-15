import { BoardState } from "./board/BoardState";
import { Move, MoveRecord, formatStandardAlgebraic } from "./Move";
import { Color } from "./Piece";
import { generateLegalMoves } from "./rules/MoveGenerator";
import { applyMove } from "./rules/StateTransitions";
import { isKingInCheck } from "./rules/Attack";

export interface PlayResult {
  success: boolean;
  notation?: string;
  error?: string;
}

export class ChessGame {
  private state: BoardState;
  private history: MoveRecord[];
  private previousStates: BoardState[];

  constructor(fen?: string) {
    this.state = fen ? BoardState.fromFEN(fen) : BoardState.initial();
    this.history = [];
    this.previousStates = [];
  }

  getLegalMoves(): Move[] {
    return generateLegalMoves(this.state);
  }

  playMove(candidate: Move): PlayResult {
    const legal = this.getLegalMoves();
    const matched = legal.find((move) => sameMove(move, candidate));
    if (!matched) {
      return { success: false, error: "Illegal move" };
    }
    const movingPiece = this.state.getPiece(matched.from);
    if (!movingPiece) {
      return { success: false, error: "No piece to move" };
    }
    this.previousStates.push(this.state);
    const nextState = applyMove(this.state, matched);
    const opponent = nextState.meta.activeColor;
    const inCheck = isKingInCheck(nextState, opponent);
    const opponentMoves = generateLegalMoves(nextState);
    const mate = inCheck && opponentMoves.length === 0;
    const notation = formatStandardAlgebraic(matched, movingPiece, this.state, legal, inCheck, mate);
    this.state = nextState;
    this.history.push({ move: matched, notation });
    return { success: true, notation };
  }

  getHistory(): MoveRecord[] {
    return [...this.history];
  }

  getLatestMove(): MoveRecord | undefined {
    return this.history[this.history.length - 1];
  }

  getBoard(): BoardState {
    return this.state;
  }

  getActiveColor(): Color {
    return this.state.meta.activeColor;
  }

  undo(): PlayResult {
    if (this.history.length === 0 || this.previousStates.length === 0) {
      return { success: false, error: "No moves to undo" };
    }
    const lastState = this.previousStates.pop();
    if (!lastState) {
      return { success: false, error: "No moves to undo" };
    }
    this.history.pop();
    this.state = lastState;
    return { success: true };
  }

  reset(fen?: string): void {
    this.state = fen ? BoardState.fromFEN(fen) : BoardState.initial();
    this.history = [];
    this.previousStates = [];
  }
}

function sameMove(a: Move, b: Move): boolean {
  return a.from.file === b.from.file && a.from.rank === b.from.rank && a.to.file === b.to.file && a.to.rank === b.to.rank && (a.promotion || "") === (b.promotion || "");
}
