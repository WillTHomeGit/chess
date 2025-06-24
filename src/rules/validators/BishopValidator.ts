// Bishop movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceValidator } from './PieceValidator';
import { isPathClear } from './PieceValidator';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class BishopValidator implements PieceValidator {
  
  // --- NEW METHOD ---
  /**
   * Generate potential bishop moves by extending in all four diagonal directions.
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const moves: BoardCoord[] = [];
    const { row, col } = from;

    const directions = [
      { dRow: 1, dCol: 1 },   // Up-Right
      { dRow: 1, dCol: -1 },  // Up-Left
      { dRow: -1, dCol: 1 },  // Down-Right
      { dRow: -1, dCol: -1 }  // Down-Left
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
   * Validate bishop move (diagonal)
   * @param board - Board state
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid bishop move
   */
  isValidMove(board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    // Must be diagonal move
    if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
      return false;
    }
    
    // Path must be clear
    return isPathClear(board, from, to);
  }
}