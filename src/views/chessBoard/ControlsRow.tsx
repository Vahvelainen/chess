import React from "react";

interface Props {
  readonly onUndo: () => void;
  readonly onReset: () => void;
}

export function ControlsRow({ onUndo, onReset }: Props): React.JSX.Element {
  return (
    <div className="controls-row">
      <button type="button" className="control-button" onClick={onUndo}>
        Undo
      </button>
      <button type="button" className="control-button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
