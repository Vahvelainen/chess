import React from "react";
import { Color } from "../../engine/Piece";
import { pieceLabel } from "./pieceHelpers";
import { SquareView } from "./boardLayoutHelpers";

interface Props {
  readonly squares: SquareView[];
  readonly files: string[];
  readonly ranks: string[];
  readonly activeColor: Color;
  readonly isHumanTurn: boolean;
  readonly onDragStart: (event: React.DragEvent<HTMLDivElement>, square: SquareView) => void;
  readonly onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  readonly onDrop: (event: React.DragEvent<HTMLDivElement>, square: SquareView) => void;
}

export function BoardGrid({
  squares,
  files,
  ranks,
  activeColor,
  isHumanTurn,
  onDragStart,
  onDragOver,
  onDrop
}: Props): React.JSX.Element {
  return (
    <div className="board-wrapper">
      <div className="board-grid-shell">
        <div className="file-labels top-labels">
          {files.map((file) => (
            <span key={`file-top-${file}`}>{file}</span>
          ))}
        </div>
        <div className="rank-labels left-labels">
          {ranks.map((rank) => (
            <span key={`rank-left-${rank}`}>{rank}</span>
          ))}
        </div>
        <div className="board-grid">
          {squares.map((square) => (
            <div
              key={`${square.file}-${square.rank}`}
              className={`square ${square.isLight ? "light" : "dark"}`}
              draggable={Boolean(isHumanTurn && square.piece && square.piece.color === activeColor)}
              onDragStart={(event) => onDragStart(event, square)}
              onDragOver={onDragOver}
              onDrop={(event) => onDrop(event, square)}
            >
              {square.piece ? (
                <div className={`piece piece-${square.piece.color}`}>
                  <span className="piece-label">{pieceLabel(square.piece)}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="rank-labels right-labels">
          {ranks.map((rank) => (
            <span key={`rank-right-${rank}`}>{rank}</span>
          ))}
        </div>
        <div className="file-labels bottom-labels">
          {files.map((file) => (
            <span key={`file-bottom-${file}`}>{file}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
