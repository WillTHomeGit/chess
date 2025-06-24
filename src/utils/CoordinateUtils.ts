// Helper functions for coordinate manipulation
import type { BoardCoord } from '../types/Board';

export class CoordinateUtils {
  /**
   * Convert canvas pixel coordinates to board coordinates
   * @param x - Canvas x coordinate
   * @param y - Canvas y coordinate  
   * @param squareSize - Size of each square in pixels
   * @returns Board coordinate (row 0-7, col 0-7)
   */
  static pixelToBoardCoord(x: number, y: number, squareSize: number): BoardCoord {
    const col = Math.floor(x / squareSize);
    const row = 7 - Math.floor(y / squareSize); // Invert for chess coordinates
    return { 
      row: Math.max(0, Math.min(7, row)), 
      col: Math.max(0, Math.min(7, col)) 
    };
  }

  /**
   * Convert board coordinates to canvas pixel coordinates
   * @param coord - Board coordinate
   * @param squareSize - Size of each square in pixels
   * @returns Object with x, y pixel coordinates
   */
  static boardCoordToPixel(coord: BoardCoord, squareSize: number): { x: number; y: number } {
    return {
      x: coord.col * squareSize,
      y: (7 - coord.row) * squareSize
    };
  }

  /**
   * Check if coordinates are within board bounds
   * @param coord - Coordinate to check
   * @returns True if valid board coordinate
   */
  static isValidCoord(coord: BoardCoord): boolean {
    return coord.row >= 0 && coord.row <= 7 && coord.col >= 0 && coord.col <= 7;
  }

  /**
   * Convert file letter (a-h) to column number (0-7)
   * @param file - File letter
   * @returns Column number
   */
  static fileToCol(file: string): number {
    return file.charCodeAt(0) - 97;
  }

  /**
   * Convert column number (0-7) to file letter (a-h)
   * @param col - Column number
   * @returns File letter
   */
  static colToFile(col: number): string {
    return String.fromCharCode(97 + col);
  }
}