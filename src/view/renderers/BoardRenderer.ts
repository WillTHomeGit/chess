// Handles drawing the static chess board
import { THEME } from '../../config/Theme';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class BoardRenderer {
  /**
   * Draw the checkerboard pattern
   * @param ctx - Canvas context to draw on
   * @param squareSize - Size of each square in pixels
   */
  drawStaticBoard(ctx: CanvasRenderingContext2D, squareSize: number): void {
    this.clearCanvas(ctx);
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 !== 0;
        ctx.fillStyle = isLight ? THEME.board.lightSquare : THEME.board.darkSquare;
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
    
    this.drawCoordinates(ctx, squareSize);
  }

  /**
   * Draw file and rank labels (a-h, 1-8)
   * @param ctx - Canvas context to draw on
   * @param squareSize - Size of each square in pixels
   */
  drawCoordinates(ctx: CanvasRenderingContext2D, squareSize: number): void {
    const fontSize = squareSize / THEME.coordinates.fontSize;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i < 8; i++) {
      // Files (a-h) at bottom
      const file = CoordinateUtils.colToFile(i);
      const rank = (8 - i).toString();
      
      const isLightFile = i % 2 === 0;
      const isLightRank = i % 2 === 0;
      
      // File labels
      ctx.fillStyle = isLightFile ? THEME.coordinates.darkSquareColor : THEME.coordinates.lightSquareColor;
      ctx.fillText(
        file, 
        i * squareSize + 4, 
        7 * squareSize + squareSize - fontSize - 4
      );
      
      // Rank labels
      ctx.fillStyle = isLightRank ? THEME.coordinates.lightSquareColor : THEME.coordinates.darkSquareColor;
      ctx.fillText(rank, 4, i * squareSize + 4);
    }
  }

  /**
   * Clear the entire canvas
   * @param ctx - Canvas context to clear
   */
  clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}