import { BoardState } from "./board/BoardState";
import { GameEndStatus, Move, MoveRecord, formatStandardAlgebraic } from "./Move";
import { Color, Piece } from "./Piece";
import { generateLegalMoves } from "./rules/MoveGenerator";
import { applyMove } from "./rules/StateTransitions";
import { isKingInCheck } from "./rules/Attack";
import { RepetitionTracker } from "./state/RepetitionTracker";
import { computeEndStatus } from "./GameEnd";

export interface PlayResult {
  success: boolean;
  notation?: string;
  error?: string;
  endStatus?: GameEndStatus;
}

export class ChessGame {
  private state: BoardState;
  private history: MoveRecord[];
  private previousStates: BoardState[];
  private endStatus: GameEndStatus | undefined;
  private repetition: RepetitionTracker;

  constructor(fen?: string) {
    this.state = fen ? BoardState.fromFEN(fen) : BoardState.initial();
    this.history = [];
    this.previousStates = [];
    this.endStatus = undefined;
    this.repetition = new RepetitionTracker(this.state);
  }

  getLegalMoves(): Move[] {
    return generateLegalMoves(this.state);
  }

  playMove(candidate: Move): PlayResult {
    if (this.endStatus) {
      return { success: false, error: "Game has ended" };
    }
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
    const { count } = this.repetition.record(nextState);
    const endStatus = computeEndStatus({
      isMate: mate,
      inCheck,
      noLegalMoves: opponentMoves.length === 0,
      movingPiece,
      repetitionCount: count
    });
    const record: MoveRecord = { move: matched, notation, endStatus };
    this.history.push(record);
    this.endStatus = endStatus;

    return { success: true, notation, endStatus };
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

  getEndStatus(): GameEndStatus | undefined {
    return this.endStatus;
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
    this.repetition.undo();
    this.state = lastState;
    this.endStatus = undefined;
    return { success: true };
  }

  reset(fen?: string): void {
    this.state = fen ? BoardState.fromFEN(fen) : BoardState.initial();
    this.history = [];
    this.previousStates = [];
    this.endStatus = undefined;
    this.repetition.reset(this.state);
  }
}

function sameMove(a: Move, b: Move): boolean {
  return a.from.file === b.from.file && a.from.rank === b.from.rank && a.to.file === b.to.file && a.to.rank === b.to.rank && (a.promotion || "") === (b.promotion || "");
}
