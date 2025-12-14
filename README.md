# chess-player

React + TypeScript chess playground built with Vite. Includes a minimal board UI, PvP and bot modes, drag-and-drop moves, promotion chooser, history list, undo/reset, and basic illegal-move feedback.

## Features

- Drag-and-drop board with edge labels and muted styling
- PvP or Bot mode; in Bot mode you pick human color, bot replies automatically with a baseline first-legal-move strategy
- Move history list and turn indicator
- Undo/reset controls
- Promotion picker (queen/rook/bishop/knight) when pawns reach last rank
- Illegal moves surface inline errors; no silent fallbacks

## Scripts

- `yarn dev` – start dev server
- `yarn build` – production build
- `yarn preview` – preview built assets
- `yarn typecheck` – run TypeScript
