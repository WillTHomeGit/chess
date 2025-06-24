// Handles drawing the pawn promotion selection dialog
import type { Move } from '../../types/Move';
import type { PieceType, PieceColor } from '../../types/Piece';
import { PROMOTION_PIECES } from '../../types/Piece';
import { CoordinateUtils } from '../../utils/CoordinateUtils';
import type { BoardCoord } from '../../types/Board';
import { THEME } from '../../config/Theme';
import { GAME_CONFIG } from '../../config/GameConfig';

export class PromotionRenderer {
  /**
   * Draws the promotion piece selection dialog over the board.
   * @param ctx The canvas context to draw on (should be the dynamic layer).
   * @param move The move that triggered the promotion.
   * @param pieceImages A map of piece keys to loaded image elements.
   * @param squareSize The size of each square in pixels.
   */
  public showPromotionDialog(
    ctx: CanvasRenderingContext2D,
    move: Move,
    pieceImages: Map<string, HTMLImageElement>,
    squareSize: number
  ): void {
    const color = move.piece.color;

    // Dim the entire board using the theme color
    ctx.fillStyle = THEME.highlights.promotionOverlay;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw each promotion choice
    PROMOTION_PIECES.forEach((pieceType, index) => {
      const choiceRow = this._getChoiceRow(index, color);
      const { x, y } = CoordinateUtils.boardCoordToPixel(
        { row: choiceRow, col: move.to.col },
        squareSize
      );

      // Draw the background square for the choice
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, squareSize, squareSize);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, squareSize, squareSize);

      // Draw the piece image onto the square
      const imageKey = this._getPieceImageKey(pieceType, color);
      const img = pieceImages.get(imageKey);
      if (img) {
        ctx.drawImage(img, x, y, squareSize, squareSize);
      }
    });
  }

  /**
   * Determines which promotion piece was selected based on the click coordinates.
   * @param move The move that triggered the promotion.
   * @param clickCoord The board coordinates of the user's click.
   * @returns The selected PieceType, or null if the click was outside the choices.
   */
  public getPromotionChoice(move: Move, clickCoord: BoardCoord): PieceType | null {
    // A promotion choice must be in the same column as the pawn.
    if (clickCoord.col !== move.to.col) {
      return null;
    }

    // Check if the clicked row matches any of the choice rows
    for (let i = 0; i < PROMOTION_PIECES.length; i++) {
      const choiceRow = this._getChoiceRow(i, move.piece.color);
      if (clickCoord.row === choiceRow) {
        return PROMOTION_PIECES[i];
      }
    }

    // The click was not on any of the promotion choice squares.
    return null;
  }

  /**
   * Calculates the row for a promotion choice based on its index and color.
   * This removes logic duplication between showPromotionDialog and getPromotionChoice.
   * @param index The index in the PROMOTION_PIECES array (0-3).
   * @param color The color of the pawn being promoted.
   * @returns The row number (0-7).
   */
  private _getChoiceRow(index: number, color: PieceColor): number {
    const promotionRank = GAME_CONFIG.promotion.ranks[color];
    const direction = color === 'white' ? -1 : 1;
    // For white, choices appear on rows 7, 6, 5, 4.
    // For black, choices appear on rows 0, 1, 2, 3.
    return promotionRank + (index * direction);
  }

  /**
   * Generates the standard string key for a piece's image.
   * @param pieceType The type of the piece.
   * @param color The color of the piece.
   * @returns The string key (e.g., 'wQ', 'bN').
   */
  private _getPieceImageKey(pieceType: PieceType, color: PieceColor): string {
    const colorPrefix = color.charAt(0);
    const pieceNotation = pieceType === 'knight' ? 'N' : pieceType.charAt(0).toUpperCase();
    return `${colorPrefix}${pieceNotation}`;
  }
}