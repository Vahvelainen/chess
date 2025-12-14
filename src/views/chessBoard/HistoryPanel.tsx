import React from "react";
import { MoveRecord } from "../../engine/Move";

interface Props {
  readonly history: MoveRecord[];
  readonly lastMove: MoveRecord | undefined;
}

export function HistoryPanel({ history, lastMove }: Props): React.JSX.Element {
  return (
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
  );
}
