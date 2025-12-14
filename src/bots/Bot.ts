import { ChessGame } from "../engine/ChessGame";
import { Move } from "../engine/Move";

export interface Bot {
  readonly name: string;
  selectMove(game: ChessGame): Move | undefined;
}
