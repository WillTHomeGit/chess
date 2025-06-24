// Base interface for piece move validation
import type { BoardState, BoardCoord } from '../../types/Board';

export interface PieceValidator {
  /**
   * Check if a move is valid for this piece type
   * @param board - Current board state
   * @param from - Starting position
   * @param to - Target position
   * @returns True if move is valid for this piece type
   */
  isValidMove(board: BoardState, from: BoardCoord, to: BoardCoord): boolean;
  
  /**
   * Generates all potential destination squares for a piece based on its
   * movement rules, ignoring the current board state (like other pieces,
   * blocks, or check conditions). This provides a list of candidates for
   * further validation.
   * @param from - Starting position of the piece
   * @returns An array of potential destination coordinates.
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[];
}

/**
 * Helper function to check if path between two squares is clear
 * @param board - Board state
 * @param from - Starting position
 * @param to - Ending position
 * @returns True if path is clear
 */
export function isPathClear(board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
  const dRow = Math.sign(to.row - from.row);
  const dCol = Math.sign(to.col - from.col);
  
  let currentRow = from.row + dRow;
  let currentCol = from.col + dCol;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += dRow;
    currentCol += dCol;
  }
  
  return true;
}