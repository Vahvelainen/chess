import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChessGame } from "../engine/ChessGame";
import { BoardState } from "../engine/board/BoardState";
import { createSquare, Square } from "../engine/board/Square";
import { Color, Piece, PieceType } from "../engine/Piece";
import { MoveRecord } from "../engine/Move";
import { AlphaBetaBot } from "../bots/AlphaBetaBot";
import { Bot } from "../bots/Bot";

interface SquareView {
  readonly file: number;
  readonly rank: number;
  readonly piece?: Piece;
  readonly isLight: boolean;
}

function pieceLabel(piece: Piece): string {
  const letters: Record<Piece["type"], string> = {
    pawn: "P",
    knight: "N",
    bishop: "B",
    rook: "R",
    queen: "Q",
    king: "K"
  };
  return letters[piece.type];
}

export function ChessBoardView(): React.JSX.Element {
  const gameRef = useRef<ChessGame>(new ChessGame());
  const botRef = useRef<Bot>(new AlphaBetaBot());
  const botRunning = useRef(false);
  const [board, setBoard] = useState<BoardState>(gameRef.current.getBoard());
  const [history, setHistory] = useState<MoveRecord[]>(gameRef.current.getHistory());
  const [error, setError] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"pvp" | "bot">("pvp");
  const [humanColor, setHumanColor] = useState<Color>("white");
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; color: Color } | undefined>(
    undefined
  );

  const squares = useMemo(() => {
    const snapshot = board.snapshot();
    const list: SquareView[] = [];
    for (let rank = 7; rank >= 0; rank -= 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const piece = snapshot[index];
        list.push({
          file,
          rank,
          piece,
          isLight: (file + rank) % 2 === 0
        });
      }
    }
    return list;
  }, [board]);

  function refreshState(): void {
    setBoard(gameRef.current.getBoard());
    setHistory(gameRef.current.getHistory());
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, square: SquareView): void {
    if (!square.piece) {
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-chess-from",
      JSON.stringify({ file: square.file, rank: square.rank })
    );
    const ghost = document.createElement("div");
    ghost.className = `drag-ghost piece piece-${square.piece.color}`;
    ghost.style.width = "56px";
    ghost.style.height = "56px";
    const label = document.createElement("span");
    label.className = "piece-label";
    label.textContent = pieceLabel(square.piece);
    ghost.appendChild(label);
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 28, 28);
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, target: SquareView): void {
    if (!isHumanTurn) {
      return;
    }
    event.preventDefault();
    const payload = event.dataTransfer.getData("application/x-chess-from");
    if (!payload) {
      return;
    }
    let from: Square | undefined;
    try {
      const parsed = JSON.parse(payload) as { file: number; rank: number };
      from = createSquare(parsed.file, parsed.rank);
    } catch (e) {
      setError("Could not parse move");
      return;
    }
    const to = createSquare(target.file, target.rank);
    if (from.file === to.file && from.rank === to.rank) {
      return;
    }
    const movingPiece = gameRef.current.getBoard().getPiece(from);
    if (movingPiece?.type === "pawn" && (to.rank === 7 || to.rank === 0)) {
      setPendingPromotion({ from, to, color: movingPiece.color });
      setError(undefined);
      return;
    }
    const result = gameRef.current.playMove({ from, to });
    if (result.success) {
      refreshState();
      setError(undefined);
      return;
    }
    if (result.error) {
      setError(result.error);
    }
  }

  function handleReset(): void {
    gameRef.current.reset();
    refreshState();
    setError(undefined);
  }

  function handleUndo(): void {
    const result = gameRef.current.undo();
    if (!result.success && result.error) {
      setError(result.error);
      return;
    }
    refreshState();
    setError(undefined);
  }

  const activeColor = gameRef.current.getActiveColor();
  const lastMove = history[history.length - 1];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const botColor: Color = humanColor === "white" ? "black" : "white";
  const isHumanTurn = mode === "pvp" || activeColor === humanColor;

  useEffect(() => {
    if (mode !== "bot") {
      return;
    }
    if (pendingPromotion) {
      return;
    }
    if (activeColor !== botColor) {
      return;
    }
    if (botRunning.current) {
      return;
    }
    botRunning.current = true;
    const move = botRef.current.selectMove(gameRef.current);
    if (!move) {
      setError("Bot has no moves");
      botRunning.current = false;
      return;
    }
    const result = gameRef.current.playMove(move);
    botRunning.current = false;
    if (result.success) {
      setBoard(gameRef.current.getBoard());
      setHistory(gameRef.current.getHistory());
      setError(undefined);
      return;
    }
    if (result.error) {
      setError(result.error);
    }
  }, [mode, activeColor, botColor]);

  function handlePromotionChoice(choice: PieceType): void {
    if (!pendingPromotion) {
      return;
    }
    const result = gameRef.current.playMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: choice });
    if (result.success) {
      setPendingPromotion(undefined);
      refreshState();
      setError(undefined);
      return;
    }
    if (result.error) {
      setError(result.error);
    }
    setPendingPromotion(undefined);
  }

  function handlePromotionCancel(): void {
    setPendingPromotion(undefined);
  }

  return (
    <main className="app-shell">
      <aside className="side-menu">
        <div className="panel-header">
          <div className="panel-title">Mode</div>
        </div>
        <div className="option-group">
          <button
            type="button"
            className={`option-button ${mode === "pvp" ? "active" : ""}`}
            onClick={() => setMode("pvp")}
          >
            PvP
          </button>
          <button
            type="button"
            className={`option-button ${mode === "bot" ? "active" : ""}`}
            onClick={() => setMode("bot")}
          >
            Bot
          </button>
        </div>
        {mode === "bot" ? (
          <>
            <div className="panel-subtitle">Human plays</div>
            <div className="option-group">
              <button
                type="button"
                className={`option-button ${humanColor === "white" ? "active" : ""}`}
                onClick={() => setHumanColor("white")}
              >
                White
              </button>
              <button
                type="button"
                className={`option-button ${humanColor === "black" ? "active" : ""}`}
                onClick={() => setHumanColor("black")}
              >
                Black
              </button>
            </div>
            <div className="hint-text">Bot moves automatically on its turn.</div>
          </>
        ) : null}
      </aside>

      <section className="board-panel">
        <header className="panel-header">
          <div className="panel-title">Chess</div>
          <div className="panel-status">
            <span className="status-dot" data-color={activeColor} />
            {activeColor === "white" ? "White to move" : "Black to move"}
          </div>
        </header>

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
                  onDragStart={(event) => handleDragStart(event, square)}
                  onDragOver={handleDragOver}
                  onDrop={(event) => handleDrop(event, square)}
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

        <div className="controls-row">
          <button type="button" className="control-button" onClick={handleUndo}>
            Undo
          </button>
          <button type="button" className="control-button" onClick={handleReset}>
            Reset
          </button>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}
      </section>

      <aside className="history-panel">
        <header className="panel-header">
          <div className="panel-title">Moves</div>
          <div className="panel-subtitle">
            {history.length === 0 ? "No moves yet" : `${history.length} move${history.length > 1 ? "s" : ""}`}
          </div>
        </header>
        <ol className="move-list">
          {history.map((record, index) => (
            <li key={`${record.notation}-${index}`} className={record === lastMove ? "move-item active" : "move-item"}>
              <span className="move-index">{index + 1}.</span>
              <span className="move-notation">{record.notation}</span>
            </li>
          ))}
        </ol>
      </aside>

      {pendingPromotion ? (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Choose promotion</div>
            <div className="option-group">
              {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((type) => (
                <button key={type} type="button" className="option-button" onClick={() => handlePromotionChoice(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <div className="controls-row">
              <button type="button" className="control-button" onClick={handlePromotionCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
