import { describe, expect, it } from "vitest";
import { AlphaBetaBot } from "../src/bots/AlphaBetaBot";
import { ChessGame } from "../src/engine/ChessGame";
import { fromAlgebraic } from "../src/engine/board/Square";
import { generateLegalMoves } from "../src/engine/rules/MoveGenerator";
import { applyMove } from "../src/engine/rules/StateTransitions";

function move(from: string, to: string) {
  return { from: fromAlgebraic(from), to: fromAlgebraic(to) };
}

describe("AlphaBetaBot", () => {
  it("selects the mate-in-one when available", () => {
    const game = new ChessGame("1n5r/8/8/8/8/8/1r6/k3K3 b - - 0 64");
    const bot = new AlphaBetaBot();

    const selected = bot.selectMove(game);

    expect(selected).toBeDefined();
    expect(selected).toEqual(move("h8", "h1"));
  });

  it("recognizes that Rh1# leaves white with no legal moves", () => {
    const game = new ChessGame("1n5r/8/8/8/8/8/1r6/k3K3 b - - 0 64");
    const playResult = game.playMove(move("h8", "h1"));

    expect(playResult.success).toBe(true);
    expect(game.getActiveColor()).toBe("white");
    expect(game.getLegalMoves()).toHaveLength(0);
  });

  it("keeps legal replies for white after a non-mating move", () => {
    const game = new ChessGame("1n5r/8/8/8/8/8/1r6/k3K3 b - - 0 64");
    const playResult = game.playMove(move("a1", "a2"));

    expect(playResult.success).toBe(true);
    expect(game.getActiveColor()).toBe("white");
    expect(game.getLegalMoves().length).toBeGreaterThan(0);

    const original = new ChessGame("1n5r/8/8/8/8/8/1r6/k3K3 b - - 0 64").getBoard();
    const nextState = applyMove(original, move("a1", "a2"));
    expect(generateLegalMoves(nextState).length).toBeGreaterThan(0);
  });

  it("scores Rh1# as the best move in minimax", () => {
    const game = new ChessGame("1n5r/8/8/8/8/8/1r6/k3K3 b - - 0 64");
    const bot = new AlphaBetaBot();
    const state = game.getBoard();
    const perspective = game.getActiveColor();
    const legalMoves = generateLegalMoves(state);

    const scored = legalMoves.map((candidate) => ({
      move: candidate,
      score: (bot as any).search(applyMove(state, candidate), 2, perspective, -Infinity, Infinity)
    }));

    const best = scored.reduce((previous, current) => (current.score > previous.score ? current : previous), scored[0]);

    expect(best.move).toEqual(move("h8", "h1"));
  });
});
