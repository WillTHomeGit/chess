// src/main.ts

import './style.css';
import { ChessGameController } from './components/ChessGameController';
import { Board } from './components/Board';
import { UIUpdater } from './view/UIUpdater';
// REMOVE: import { TerminalManager } from './dev/TerminalManager';
import { DebugLogger } from './dev/DebugLogger';

async function main() {
  const logger = new DebugLogger();

  const canvasContainer = document.querySelector<HTMLDivElement>('#canvas-container');
  if (!canvasContainer) {
    throw new Error("Fatal Error: Could not find canvas container element with id 'canvas-container'.");
  }

  // Pass the logger into the controller
  const chessGame = new ChessGameController(logger);

  // Create the view components and wire them up with callbacks
  const board = new Board(
    canvasContainer,
    chessGame.events,
    (row, col) => chessGame.handleSquareClick(row, col),
    (pieceType) => chessGame.onPromotionPieceSelected(pieceType)
  );
  new UIUpdater(chessGame.events);

  // Explicitly initialize the board and wait for it to be ready
  await board.init(chessGame);

  // Trigger the first text update
  chessGame.emitUITextUpdate();

  // Expose for debugging
  (window as any).chessGame = chessGame;
  (window as any).board = board;

  // --- START OF MODIFICATION ---
  // The old logic for TerminalManager has been completely removed.
  // We will simply log a message if debug mode is active.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    console.log("%cDebug mode is ON. Detailed logs will be printed to the console.", "color: orange; font-weight: bold;");
  }
  // --- END OF MODIFICATION ---
}

main().catch(err => {
  console.error("Failed to initialize the application:", err);
});