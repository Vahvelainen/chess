import React from "react";
import { AlphaBetaBot } from "../bots/AlphaBetaBot";
import { BoardGrid } from "./chessBoard/BoardGrid";
import { ControlsRow } from "./chessBoard/ControlsRow";
import { HistoryPanel } from "./chessBoard/HistoryPanel";
import { PromotionModal } from "./chessBoard/PromotionModal";
import { SideMenu } from "./chessBoard/SideMenu";
import { useChessGameController } from "./chessBoard/useChessGameController";

export function ChessBoardView(): React.JSX.Element {
  const controller = useChessGameController(new AlphaBetaBot());
  return (
    <main className="app-shell">
      <SideMenu
        mode={controller.mode}
        humanColor={controller.humanColor}
        onModeChange={controller.setMode}
        onHumanColorChange={controller.setHumanColor}
      />

      <section className="board-panel">
        <header className="panel-header">
          <div className="panel-title">Chess</div>
          <div className="panel-status">
            <span className="status-dot" data-color={controller.activeColor} />
            {controller.activeColor === "white" ? "White to move" : "Black to move"}
          </div>
        </header>

        <BoardGrid
          squares={controller.squares}
          files={controller.files}
          ranks={controller.ranks}
          activeColor={controller.activeColor}
          isHumanTurn={controller.isHumanTurn}
          onDragStart={controller.handleDragStart}
          onDragOver={controller.handleDragOver}
          onDrop={controller.handleDrop}
        />

        <ControlsRow onUndo={controller.handleUndo} onReset={controller.handleReset} />

        {controller.error ? <div className="error-banner">{controller.error}</div> : null}
      </section>

      <HistoryPanel history={controller.history} lastMove={controller.lastMove} />

      <PromotionModal
        pendingPromotion={controller.pendingPromotion}
        onChoice={controller.handlePromotionChoice}
        onCancel={controller.handlePromotionCancel}
      />
    </main>
  );
}
