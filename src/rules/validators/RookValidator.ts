// Rook movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceValidator } from './PieceValidator';
import { isPathClear } from './PieceValidator';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class RookValidator implements PieceValidator {
  
  // --- NEW METHOD ---
  /**
   * Generate potential rook moves by extending in all four orthogonal directions.
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const moves: BoardCoord[] = [];
    const { row, col } = from;

    const directions = [
      { dRow: 1, dCol: 0 },   // Up
      { dRow: -1, dCol: 0 },  // Down
      { dRow: 0, dCol: 1 },   // Right
      { dRow: 0, dCol: -1 }   // Left
    ];

    for (const dir of directions) {
      let currentPos: BoardCoord = { row: row + dir.dRow, col: col + dir.dCol };
      while (CoordinateUtils.isValidCoord(currentPos)) {
        moves.push(currentPos);
        currentPos = { row: currentPos.row + dir.dRow, col: currentPos.col + dir.dCol };
      }
    }

    return moves;
  }
  
  /**
   * Validate rook move (horizontal/vertical)
   * @param board - Board state
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid rook move
   */
  isValidMove(board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    // Must be horizontal or vertical move
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }
    
    // Path must be clear
    return isPathClear(board, from, to);
  }
}