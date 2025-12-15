import { pieceSprite } from "../pieceHelpers";
import { SquareView } from "../boardLayoutHelpers";

export function createGhostElement(piece: SquareView["piece"] | undefined): HTMLImageElement | undefined {
  if (!piece) {
    return undefined;
  }
  const ghost = document.createElement("img");
  ghost.className = `touch-ghost piece piece-${piece.color}`;
  ghost.width = 56;
  ghost.height = 56;
  ghost.src = pieceSprite(piece);
  ghost.style.width = "56px";
  ghost.style.height = "56px";
  ghost.style.maxWidth = "56px";
  ghost.style.maxHeight = "56px";
  ghost.draggable = false;
  ghost.style.position = "fixed";
  ghost.style.pointerEvents = "none";
  ghost.style.transform = "translate(-50%, -50%)";
  ghost.style.zIndex = "9999";
  const filter =
    piece.color === "white"
      ? "brightness(0) invert(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))"
      : "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))";
  ghost.style.filter = filter;
  ghost.style.webkitFilter = filter;
  ghost.style.left = "-9999px";
  ghost.style.top = "-9999px";
  document.body.appendChild(ghost);
  return ghost;
}

export function updateGhostPosition(ghost: HTMLImageElement | undefined, x: number, y: number): void {
  if (!ghost) {
    return;
  }
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
}
