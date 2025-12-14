import { BoardState } from "./board/BoardState";
import { Move, MoveRecord, formatLongAlgebraic } from "./Move";
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

  constructor(fen?: string) {
    this.state = fen ? BoardState.fromFEN(fen) : BoardState.initial();
    this.history = [];
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
    const nextState = applyMove(this.state, matched);
    const opponent = nextState.meta.activeColor;
    const inCheck = isKingInCheck(nextState, opponent);
    const opponentMoves = generateLegalMoves(nextState);
    const mate = inCheck && opponentMoves.length === 0;
    const notation = formatLongAlgebraic(matched, movingPiece, inCheck, mate);
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
}

function sameMove(a: Move, b: Move): boolean {
  return a.from.file === b.from.file && a.from.rank === b.from.rank && a.to.file === b.to.file && a.to.rank === b.to.rank && (a.promotion || "") === (b.promotion || "");
}
