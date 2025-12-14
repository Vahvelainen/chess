import { Piece } from "../../engine/Piece";
import bishop from "../../assets/pieces/bishop.svg";
import king from "../../assets/pieces/king.svg";
import knight from "../../assets/pieces/knight.svg";
import pawn from "../../assets/pieces/pawn.svg";
import queen from "../../assets/pieces/queen.svg";
import rook from "../../assets/pieces/rook.svg";

const pieceSprites: Record<Piece["type"], string> = {
  pawn,
  knight,
  bishop,
  rook,
  queen,
  king
};

export function pieceSprite(piece: Piece): string {
  return pieceSprites[piece.type];
}
