import React from "react";
import { PieceType } from "../../engine/Piece";
import { PromotionRequest } from "./useChessGameController";

interface Props {
  readonly pendingPromotion: PromotionRequest | undefined;
  readonly onChoice: (type: PieceType) => void;
  readonly onCancel: () => void;
}

export function PromotionModal({ pendingPromotion, onChoice, onCancel }: Props): React.JSX.Element | null {
  if (!pendingPromotion) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Choose promotion</div>
        <div className="option-group">
          {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((type) => (
            <button key={type} type="button" className="option-button" onClick={() => onChoice(type)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="controls-row">
          <button type="button" className="control-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
