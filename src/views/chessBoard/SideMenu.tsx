import React from "react";
import { Color } from "../../engine/Piece";

interface Props {
  readonly mode: "pvp" | "bot";
  readonly humanColor: Color;
  readonly onModeChange: (mode: "pvp" | "bot") => void;
  readonly onHumanColorChange: (color: Color) => void;
}

export function SideMenu({ mode, humanColor, onModeChange, onHumanColorChange }: Props): React.JSX.Element {
  return (
    <aside className="side-menu">
      <div className="panel-header">
        <div className="panel-title">Mode</div>
      </div>
      <div className="option-group">
        <button type="button" className={`option-button ${mode === "pvp" ? "active" : ""}`} onClick={() => onModeChange("pvp")}>
          PvP
        </button>
        <button type="button" className={`option-button ${mode === "bot" ? "active" : ""}`} onClick={() => onModeChange("bot")}>
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
              onClick={() => onHumanColorChange("white")}
            >
              White
            </button>
            <button
              type="button"
              className={`option-button ${humanColor === "black" ? "active" : ""}`}
              onClick={() => onHumanColorChange("black")}
            >
              Black
            </button>
          </div>
          <div className="hint-text">Bot moves automatically on its turn.</div>
        </>
      ) : null}
    </aside>
  );
}
