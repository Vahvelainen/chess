import { describe, expect, it } from "vitest";
import { ChessGame } from "../src/engine/ChessGame";
import { fromAlgebraic } from "../src/engine/board/Square";

function move(from: string, to: string, promotion?: "queen" | "rook" | "bishop" | "knight") {
  return { from: fromAlgebraic(from), to: fromAlgebraic(to), promotion };
}

describe("ChessGame", () => {
  it("plays Fool's Mate and reports mate notation", () => {
    const game = new ChessGame();
    expect(game.playMove(move("f2", "f3")).success).toBe(true);
    expect(game.playMove(move("e7", "e5")).success).toBe(true);
    expect(game.playMove(move("g2", "g4")).success).toBe(true);
    const result = game.playMove(move("d8", "h4"));
    expect(result.success).toBe(true);
    const latest = game.getLatestMove();
    expect(latest?.notation.endsWith("#")).toBe(true);
  });

  it("allows king side castling", () => {
    const game = new ChessGame();
    game.playMove(move("e2", "e4"));
    game.playMove(move("e7", "e5"));
    game.playMove(move("g1", "f3"));
    game.playMove(move("b8", "c6"));
    game.playMove(move("f1", "c4"));
    game.playMove(move("g8", "f6"));
    const castle = game.playMove(move("e1", "g1"));
    expect(castle.success).toBe(true);
    const board = game.getBoard();
    expect(board.getPiece(fromAlgebraic("g1"))?.type).toBe("king");
    expect(board.getPiece(fromAlgebraic("f1"))?.type).toBe("rook");
  });

  it("promotes a pawn", () => {
    const game = new ChessGame("k7/4P3/8/8/8/8/8/K7 w - - 0 1");
    const result = game.playMove(move("e7", "e8", "queen"));
    expect(result.success).toBe(true);
    expect(result.notation).toBe("e7e8=Q+");
    const piece = game.getBoard().getPiece(fromAlgebraic("e8"));
    expect(piece?.type).toBe("queen");
  });

  it("rejects illegal moves", () => {
    const game = new ChessGame();
    const result = game.playMove(move("e2", "e5"));
    expect(result.success).toBe(false);
  });
});
