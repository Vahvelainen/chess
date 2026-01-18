import { Bot } from "./Bot";
import { ChessGame } from "../engine/ChessGame";
import { Move } from "../engine/Move";
import { Color } from "../engine/Piece";
import { BoardState } from "../engine/board/BoardState";
import { generateLegalMoves } from "../engine/rules/MoveGenerator";
import { applyMove } from "../engine/rules/StateTransitions";
import { isKingInCheck } from "../engine/rules/Attack";
import { materialScore } from "./Evaluation";

const MAX_DEPTH = 3;
const CHECKMATE_SCORE = 1000000;
const DRAW_PENALTY = -1;

export class AlphaBetaBot implements Bot {
  readonly name = "Alpha-Beta Depth 5";

  selectMove(game: ChessGame): Move | undefined {
    const state = game.getBoard();
    const perspective = game.getActiveColor();
    const legalMoves = generateLegalMoves(state);
    if (legalMoves.length === 0) {
      return undefined;
    }

    let bestScore = -Infinity;
    let bestMove: Move | undefined;

    for (const move of legalMoves) {
      const nextState = applyMove(state, move);
      const score = this.search(nextState, MAX_DEPTH - 1, perspective, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private search(state: BoardState, depth: number, perspective: Color, alpha: number, beta: number): number {
    const legalMoves = generateLegalMoves(state);
    const inCheck = isKingInCheck(state, state.meta.activeColor);
    const terminal = this.evaluateTerminal(state, perspective, depth, legalMoves.length === 0, inCheck);
    if (terminal !== undefined) {
      return terminal;
    }

    if (state.meta.activeColor === perspective) {
      let value = -Infinity;
      for (const move of legalMoves) {
        const nextState = applyMove(state, move);
        value = Math.max(value, this.search(nextState, depth - 1, perspective, alpha, beta));
        alpha = Math.max(alpha, value);
        if (alpha >= beta) {
          break;
        }
      }
      return value;
    }

    let value = Infinity;
    for (const move of legalMoves) {
      const nextState = applyMove(state, move);
      value = Math.min(value, this.search(nextState, depth - 1, perspective, alpha, beta));
      beta = Math.min(beta, value);
      if (beta <= alpha) {
        break;
      }
    }
    return value;
  }

  private evaluateTerminal(
    state: BoardState,
    perspective: Color,
    depth: number,
    noLegalMoves: boolean,
    inCheck: boolean
  ): number | undefined {
    if (noLegalMoves) {
      if (inCheck) {
        const losingTurn = state.meta.activeColor === perspective;
        const distanceBonus = depth;
        return losingTurn ? -CHECKMATE_SCORE - distanceBonus : CHECKMATE_SCORE + distanceBonus;
      }
      return DRAW_PENALTY;
    }
    if (depth === 0) {
      return materialScore(state, perspective);
    }
    return undefined;
  }
}
