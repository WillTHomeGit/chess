// King movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceValidator } from './PieceValidator';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class KingValidator implements PieceValidator {
  
  // --- NEW METHOD ---
  /**
   * Generate potential king moves (one square in any direction).
   * This does not include castling, which is a special move handled
   * at the game logic level.
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const moves: BoardCoord[] = [];
    const { row, col } = from;

    // Iterate over all 8 adjacent squares
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) {
          continue; // Skip the square the king is already on
        }
        
        const to: BoardCoord = { row: row + dRow, col: col + dCol };
        if (CoordinateUtils.isValidCoord(to)) {
          moves.push(to);
        }
      }
    }

    return moves;
  }
  
  /**
   * Validate king move (one square in any direction)
   * @param board - Board state (not used for basic king moves)
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid king move
   */
  isValidMove(_board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    return rowDiff <= 1 && colDiff <= 1;
  }
}