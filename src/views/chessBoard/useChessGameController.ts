import { useEffect, useMemo, useRef, useState } from "react";
import { ChessGame } from "../../engine/ChessGame";
import { BoardState } from "../../engine/board/BoardState";
import { Color, PieceType } from "../../engine/Piece";
import { GameEndStatus, MoveRecord } from "../../engine/Move";
import { Bot } from "../../bots/Bot";
import { fileLabels, mapBoardToSquares, rankLabels, SquareView } from "./boardLayoutHelpers";
import { handleDragOver, handleDragStart, createHandleDrop } from "./dragDrop/mouseHandlers";
import { createTouchHandlers } from "./dragDrop/touchHandlers";

export interface PromotionRequest {
  readonly from: { file: number; rank: number };
  readonly to: { file: number; rank: number };
  readonly color: Color;
}

export function useChessGameController(bot: Bot) {
  const gameRef = useRef<ChessGame>(new ChessGame());
  const botRef = useRef<Bot>(bot);
  const botRunning = useRef(false);
  const [board, setBoard] = useState<BoardState>(gameRef.current.getBoard());
  const [history, setHistory] = useState<MoveRecord[]>(gameRef.current.getHistory());
  const [error, setError] = useState<string | undefined>(undefined);
  const [endStatus, setEndStatus] = useState<GameEndStatus | undefined>(undefined);
  const [mode, setMode] = useState<"pvp" | "bot">("pvp");
  const [humanColor, setHumanColor] = useState<Color>("white");
  const [pendingPromotion, setPendingPromotion] = useState<PromotionRequest | undefined>(undefined);

  const squares = useMemo(() => mapBoardToSquares(board), [board]);
  const activeColor = gameRef.current.getActiveColor();
  const lastMove = history[history.length - 1];
  const botColor: Color = humanColor === "white" ? "black" : "white";
  const isHumanTurn = mode === "pvp" || activeColor === humanColor;

  function refreshState(): void {
    setBoard(gameRef.current.getBoard());
    setHistory(gameRef.current.getHistory());
  }

  const handleDrop = createHandleDrop({
    isHumanTurn,
    game: gameRef.current,
    setError,
    setEndStatus,
    setPendingPromotion,
    refresh: refreshState
  });

  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = createTouchHandlers({
    isHumanTurn,
    game: gameRef.current,
    setError,
    setEndStatus,
    setPendingPromotion,
    refresh: refreshState
  });

  function handleReset(): void {
    gameRef.current.reset();
    refreshState();
    setError(undefined);
    setEndStatus(undefined);
  }

  function handleUndo(): void {
    const targetUndos = mode === "bot" ? Math.min(2, history.length) : 1;
    if (targetUndos === 0) {
      setError("No moves to undo");
      return;
    }

    let completedUndos = 0;
    while (completedUndos < targetUndos) {
      const result = gameRef.current.undo();
      if (!result.success) {
        if (result.error) {
          setError(result.error);
        }
        break;
      }
      completedUndos += 1;
    }

    if (completedUndos > 0) {
      refreshState();
      setError(undefined);
      setEndStatus(gameRef.current.getEndStatus());
    }
  }

  useEffect(() => {
    if (mode !== "bot" || pendingPromotion || activeColor !== botColor || botRunning.current) {
      return;
    }
    if (gameRef.current.getEndStatus()) {
      setEndStatus(gameRef.current.getEndStatus());
      return;
    }
    botRunning.current = true;
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
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
        setEndStatus(result.endStatus);
        return;
      }
      if (result.error) {
        setError(result.error);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      botRunning.current = false;
    };
  }, [mode, activeColor, botColor, pendingPromotion]);

  function handlePromotionChoice(choice: PieceType): void {
    if (!pendingPromotion) {
      return;
    }
    const result = gameRef.current.playMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: choice });
    if (result.success) {
      setPendingPromotion(undefined);
      refreshState();
      setError(undefined);
      setEndStatus(result.endStatus);
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

  function bannerState(): { message: string; tone: "error" | "info" | "success" } | undefined {
    if (endStatus) {
      if (endStatus.type === "checkmate") {
        const message = `${endStatus.winner === "white" ? "White" : "Black"} wins by checkmate`;
        return { message, tone: "success" };
      }
      if (endStatus.type === "stalemate") {
        return { message: "Draw by stalemate", tone: "info" };
      }
      return { message: "Draw by threefold repetition", tone: "info" };
    }
    if (error) {
      return { message: error, tone: "error" };
    }
    return undefined;
  }

  return {
    squares,
    files: fileLabels,
    ranks: rankLabels,
    activeColor,
    history,
    lastMove,
    banner: bannerState(),
    mode,
    humanColor,
    isHumanTurn,
    pendingPromotion,
    error,
    endStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleReset,
    handleUndo,
    handlePromotionChoice,
    handlePromotionCancel,
    setMode,
    setHumanColor
  };
}
