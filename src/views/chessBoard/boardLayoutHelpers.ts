import { BoardState } from "../../engine/board/BoardState";
import { Piece } from "../../engine/Piece";

export interface SquareView {
  readonly file: number;
  readonly rank: number;
  readonly piece?: Piece;
  readonly isLight: boolean;
}

export const fileLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const rankLabels = ["8", "7", "6", "5", "4", "3", "2", "1"];

export function mapBoardToSquares(board: BoardState): SquareView[] {
  const snapshot = board.snapshot();
  const squares: SquareView[] = [];
  for (let rank = 7; rank >= 0; rank -= 1) {
    for (let file = 0; file < 8; file += 1) {
      const index = rank * 8 + file;
      squares.push({
        file,
        rank,
        piece: snapshot[index],
        isLight: (file + rank) % 2 === 0
      });
    }
  }
  return squares;
}
