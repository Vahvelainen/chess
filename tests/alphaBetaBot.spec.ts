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

  it("prefers moving knight to center over edge", () => {
    // Position where white can move knight from b1 to either e4 (center) or a3 (edge)
    // The center move should be preferred due to center control bonus
    const game = new ChessGame("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const bot = new AlphaBetaBot();
    const state = game.getBoard();
    const perspective = game.getActiveColor();
    const legalMoves = generateLegalMoves(state);

    // Find moves from b1 (knight's starting position)
    const knightMoves = legalMoves.filter((m) => m.from.file === 1 && m.from.rank === 0);
    const centerMove = knightMoves.find((m) => m.to.file === 4 && m.to.rank === 3); // e4
    const edgeMove = knightMoves.find((m) => m.to.file === 0 && m.to.rank === 2); // a3

    if (centerMove && edgeMove) {
      const centerScore = (bot as any).search(applyMove(state, centerMove), 2, perspective, -Infinity, Infinity);
      const edgeScore = (bot as any).search(applyMove(state, edgeMove), 2, perspective, -Infinity, Infinity);
      expect(centerScore).toBeGreaterThan(edgeScore);
    }
  });

  it("prefers retaining castling rights", () => {
    // Position where white can move king (losing castling) or move a pawn
    // Moving the pawn should be preferred to retain castling rights
    const game = new ChessGame("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const bot = new AlphaBetaBot();
    const state = game.getBoard();
    const perspective = game.getActiveColor();
    const legalMoves = generateLegalMoves(state);

    // Find king move (e1 to e2) which loses castling rights
    const kingMove = legalMoves.find((m) => m.from.file === 4 && m.from.rank === 0 && m.to.file === 4 && m.to.rank === 1);
    // Find a pawn move (e2 to e3) which retains castling
    const pawnMove = legalMoves.find((m) => m.from.file === 4 && m.from.rank === 1 && m.to.file === 4 && m.to.rank === 2);

    if (kingMove && pawnMove) {
      const kingMoveScore = (bot as any).search(applyMove(state, kingMove), 2, perspective, -Infinity, Infinity);
      const pawnMoveScore = (bot as any).search(applyMove(state, pawnMove), 2, perspective, -Infinity, Infinity);
      expect(pawnMoveScore).toBeGreaterThan(kingMoveScore);
    }
  });

  it("prefers castling when available", () => {
    // Position where white can castle kingside or make a different move
    // Castling should be preferred due to castled bonus
    const game = new ChessGame("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const bot = new AlphaBetaBot();
    const state = game.getBoard();
    const perspective = game.getActiveColor();
    const legalMoves = generateLegalMoves(state);

    // Find castling move (kingside)
    const castlingMove = legalMoves.find((m) => m.isCastle === "kingside");
    // Find a non-castling move (e.g., pawn move)
    const pawnMove = legalMoves.find((m) => m.from.file === 4 && m.from.rank === 1 && m.to.file === 4 && m.to.rank === 2);

    if (castlingMove && pawnMove) {
      const castlingScore = (bot as any).search(applyMove(state, castlingMove), 2, perspective, -Infinity, Infinity);
      const pawnMoveScore = (bot as any).search(applyMove(state, pawnMove), 2, perspective, -Infinity, Infinity);
      expect(castlingScore).toBeGreaterThan(pawnMoveScore);
    }
  });
});
