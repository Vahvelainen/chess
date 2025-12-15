import React, { useEffect, useMemo, useRef } from "react";
import { MoveRecord } from "../../engine/Move";

interface Props {
  readonly history: MoveRecord[];
  readonly lastMove: MoveRecord | undefined;
}

export function HistoryPanel({ history, lastMove }: Props): React.JSX.Element {
  const listRef = useRef<HTMLOListElement>(null);
  const pairedHistory = useMemo(() => {
    const pairs: Array<{ index: number; white?: MoveRecord; black?: MoveRecord }> = [];
    history.forEach((record, idx) => {
      const turnIndex = Math.floor(idx / 2);
      if (!pairs[turnIndex]) {
        pairs[turnIndex] = { index: turnIndex + 1 };
      }
      if (idx % 2 === 0) {
        pairs[turnIndex].white = record;
      } else {
        pairs[turnIndex].black = record;
      }
    });
    return pairs;
  }, [history]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history.length]);

  return (
    <aside className="history-panel">
      <header className="panel-header">
        <div className="panel-title">Moves</div>
        <div className="panel-subtitle">
          {history.length === 0 ? "No moves yet" : `${history.length} move${history.length > 1 ? "s" : ""}`}
        </div>
      </header>
      <ol className="move-list" ref={listRef}>
        {pairedHistory.map((entry: { index: number; white?: MoveRecord; black?: MoveRecord }) => {
          const isActive = entry.white === lastMove || entry.black === lastMove;
          return (
            <li key={`turn-${entry.index}`} className={isActive ? "move-item active" : "move-item"}>
              <span className="move-index">{entry.index}.</span>
              <span className="move-notation">{entry.white?.notation ?? ""}</span>
              <span className="move-notation">{entry.black?.notation ?? ""}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
