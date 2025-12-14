import { Bot } from "./Bot";
import { ChessGame } from "../engine/ChessGame";
import { Move } from "../engine/Move";

export class BaseBot implements Bot {
  readonly name = "Base Bot";

  selectMove(game: ChessGame): Move | undefined {
    const legal = game.getLegalMoves();
    return legal[0];
  }
}
