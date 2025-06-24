// src/view/renderers/HighlightRenderer.ts

import type { BoardState, BoardCoord } from '../../types/Board';
import type { Move } from '../../types/Move';
import { THEME } from '../../config/Theme';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class HighlightRenderer {
  /**
   * Draw highlight for the last move (from and to squares) with a soft outline
   * and distinct colors for the starting and ending squares.
   */
  drawLastMoveHighlight(ctx: CanvasRenderingContext2D, move: Move, squareSize: number): void {
    // --- Draw the FROM square highlight ---
    const fromPos = move.from;
    const { x: fromX, y: fromY } = CoordinateUtils.boardCoordToPixel(fromPos, squareSize);
    const isFromLight = (fromPos.row + fromPos.col) % 2 !== 0;

    ctx.shadowColor = THEME.highlights.highlightOutline;
    ctx.shadowBlur = THEME.highlights.highlightOutlineBlur;
    ctx.fillStyle = isFromLight ? THEME.highlights.lastMoveFromLight : THEME.highlights.lastMoveFromDark;
    ctx.fillRect(fromX, fromY, squareSize, squareSize);
    
    // --- Draw the TO square highlight ---
    const toPos = move.to;
    const { x: toX, y: toY } = CoordinateUtils.boardCoordToPixel(toPos, squareSize);
    const isToLight = (toPos.row + toPos.col) % 2 !== 0;

    ctx.shadowColor = THEME.highlights.highlightOutline;
    ctx.shadowBlur = THEME.highlights.highlightOutlineBlur;
    ctx.fillStyle = isToLight ? THEME.highlights.lastMoveToLight : THEME.highlights.lastMoveToDark;
    ctx.fillRect(toX, toY, squareSize, squareSize);

    // Finally, reset the shadow so it doesn't affect other drawings.
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  /**
   * Draw highlight for currently selected square with a soft outline.
   */
  drawSelectedSquare(ctx: CanvasRenderingContext2D, pos: BoardCoord, squareSize: number): void {
    const { x, y } = CoordinateUtils.boardCoordToPixel(pos, squareSize);
    
    // --- START OF MODIFICATION ---
    // Apply the shadow for the soft outline.
    ctx.shadowColor = THEME.highlights.highlightOutline;
    ctx.shadowBlur = THEME.highlights.highlightOutlineBlur;
    // --- END OF MODIFICATION ---

    ctx.fillStyle = THEME.highlights.selectedSquare;
    ctx.fillRect(x, y, squareSize, squareSize);

    // --- START OF MODIFICATION ---
    // Reset the shadow so it doesn't affect other drawings on the same canvas.
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    // --- END OF MODIFICATION ---
  }

  /**
   * Draw indicators for all valid moves from selected piece.
   */
  drawValidMoves(ctx: CanvasRenderingContext2D, moves: Move[], board: BoardState, squareSize: number): void {
    for (const move of moves) {
      const { x, y } = CoordinateUtils.boardCoordToPixel(move.to, squareSize);
      const centerX = x + squareSize / 2;
      const centerY = y + squareSize / 2;
      
      const isCapture = board[move.to.row][move.to.col] !== null || move.isEnPassant;
      
      if (isCapture) {
        // Draw ring for captures, using values from the theme.
        ctx.strokeStyle = THEME.highlights.captureMove;
        ctx.lineWidth = THEME.highlights.captureRingWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, squareSize / THEME.highlights.captureRingRadiusRatio, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Draw dot for normal moves, using value from the theme.
        ctx.fillStyle = THEME.highlights.validMove;
        ctx.beginPath();
        ctx.arc(centerX, centerY, squareSize / THEME.highlights.validMoveDotRadiusRatio, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draw red overlay on king when in check with a soft outline.
   */
  drawCheckIndicator(ctx: CanvasRenderingContext2D, kingPos: BoardCoord, squareSize: number): void {
    const { x, y } = CoordinateUtils.boardCoordToPixel(kingPos, squareSize);
    
    // Apply the shadow for the soft outline.
    ctx.shadowColor = THEME.highlights.highlightOutline;
    ctx.shadowBlur = THEME.highlights.highlightOutlineBlur;

    ctx.fillStyle = THEME.highlights.check;
    ctx.fillRect(x, y, squareSize, squareSize);

    // Reset the shadow.
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  /**
   * Clear the canvas.
   */
  clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}