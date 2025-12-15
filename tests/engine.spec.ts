import { describe, expect, it } from "vitest";
import { ChessGame } from "../src/engine/ChessGame";
import { fromAlgebraic } from "../src/engine/board/Square";
import { GameEndStatus } from "../src/engine/Move";

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

  it("detects stalemate after a move", () => {
    const game = new ChessGame("5Q1k/8/6K1/8/8/8/8/8 w - - 0 1");
    const result = game.playMove(move("f8", "f7"));
    expect(result.success).toBe(true);
    expect(result.endStatus?.type).toBe<GameEndStatus["type"]>("stalemate");
    expect(game.getEndStatus()?.type).toBe("stalemate");
  });

  it("clears end status when undoing a stalemate move", () => {
    const game = new ChessGame("5Q1k/8/6K1/8/8/8/8/8 w - - 0 1");
    const stalemateResult = game.playMove(move("f8", "f7"));
    expect(stalemateResult.success).toBe(true);
    expect(game.getEndStatus()?.type).toBe("stalemate");

    const undoResult = game.undo();
    expect(undoResult.success).toBe(true);
    expect(game.getEndStatus()).toBeUndefined();
    expect(game.getLegalMoves().length).toBeGreaterThan(0);

    const replayResult = game.playMove(move("f8", "f7"));
    expect(replayResult.success).toBe(true);
    expect(game.getEndStatus()?.type).toBe("stalemate");
  });

  it("detects threefold repetition", () => {
    const game = new ChessGame();
    const sequence = [
      move("g1", "f3"),
      move("g8", "f6"),
      move("f3", "g1"),
      move("f6", "g8"),
      move("g1", "f3"),
      move("g8", "f6"),
      move("f3", "g1"),
      move("f6", "g8")
    ];
    let latest: ReturnType<ChessGame["playMove"]> | undefined;
    sequence.forEach((m) => {
      latest = game.playMove(m);
      expect(latest.success).toBe(true);
    });
    expect(latest?.endStatus?.type).toBe<GameEndStatus["type"]>("threefold-repetition");
    expect(game.getEndStatus()?.type).toBe("threefold-repetition");
  });
});
