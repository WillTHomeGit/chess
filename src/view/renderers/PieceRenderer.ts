// Handles drawing chess pieces
import type { Piece } from '../../types/Piece'; // Corrected import
import type { BoardState, BoardCoord } from '../../types/Board';
import { GAME_CONFIG } from '../../config/GameConfig';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class PieceRenderer {
  private pieceImages: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;

  /**
   * Load all piece images asynchronously
   * @returns Promise that resolves when all images are loaded
   */
  async preloadImages(): Promise<void> {
    const pieces = ['wR', 'wN', 'wB', 'wQ', 'wK', 'wP', 'bR', 'bN', 'bB', 'bQ', 'bK', 'bP'];
    const { imagePath, imageExtension } = GAME_CONFIG.pieces;
    
    const promises = pieces.map(pieceKey => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = `${imagePath}${pieceKey}${imageExtension}`;
        img.onload = () => {
          this.pieceImages.set(pieceKey, img);
          resolve();
        };
        img.onerror = () => {
          reject(`Could not load image: ${pieceKey}${imageExtension}`);
        };
      });
    });
    
    await Promise.all(promises);
    this.imagesLoaded = true;
  }
  
  // --- METHOD ADDED ---
  /**
   * Public getter to allow other components (like the Board) to access
   * the pre-loaded piece images for rendering UI like the promotion dialog.
   * @returns The map of piece keys to loaded HTMLImageElement objects.
   */
  public getPieceImages(): Map<string, HTMLImageElement> {
    return this.pieceImages;
  }

  /**
   * Draw a single piece at the specified position
   * @param ctx - Canvas context to draw on
   * @param piece - Piece to draw
   * @param pos - Board position
   * @param squareSize - Size of each square in pixels
   */
  drawPiece(ctx: CanvasRenderingContext2D, piece: Piece, pos: BoardCoord, squareSize: number): void {
    if (!this.imagesLoaded) return;
    
    const { x, y } = CoordinateUtils.boardCoordToPixel(pos, squareSize);
    const imageKey = this.getPieceImageKey(piece);
    const img = this.pieceImages.get(imageKey);
    
    if (img) {
      ctx.drawImage(img, x, y, squareSize, squareSize);
    }
  }

  /**
   * Draw all pieces on the board
   * @param ctx - Canvas context to draw on
   * @param board - Current board state
   * @param squareSize - Size of each square in pixels
   */
  drawAllPieces(ctx: CanvasRenderingContext2D, board: BoardState, squareSize: number): void {
    // --- START OF FIX ---
    // The Board component is now responsible for clearing the canvas before this is called.
    // --- END OF FIX ---
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          this.drawPiece(ctx, piece, { row, col }, squareSize);
        }
      }
    }
  }

  /**
   * Generate the image key for a piece
   * @param piece - Piece to get key for
   * @returns String key for image lookup
   */
  private getPieceImageKey(piece: Piece): string {
    const colorPrefix = piece.color.charAt(0); // 'w' or 'b'
    const pieceNotation = piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
    return `${colorPrefix}${pieceNotation}`;
  }

  /**
   * Check if images are loaded
   * @returns True if all images are loaded
   */
  isReady(): boolean {
    return this.imagesLoaded;
  }
}