// Knight movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceValidator } from './PieceValidator';
import { CoordinateUtils } from '../../utils/CoordinateUtils';

export class KnightValidator implements PieceValidator {
  
  // --- NEW METHOD ---
  /**
   * Generate potential knight moves (L-shapes).
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const moves: BoardCoord[] = [];
    const { row, col } = from;

    const potentialOffsets = [
      { dRow: 1, dCol: 2 }, { dRow: 1, dCol: -2 },
      { dRow: -1, dCol: 2 }, { dRow: -1, dCol: -2 },
      { dRow: 2, dCol: 1 }, { dRow: 2, dCol: -1 },
      { dRow: -2, dCol: 1 }, { dRow: -2, dCol: -1 }
    ];

    for (const offset of potentialOffsets) {
      const to: BoardCoord = { row: row + offset.dRow, col: col + offset.dCol };
      if (CoordinateUtils.isValidCoord(to)) {
        moves.push(to);
      }
    }

    return moves;
  }
  
  /**
   * Validate knight move (L-shape)
   * @param board - Board state (not used for knight)
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid knight move
   */
  isValidMove(_board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    return (rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1);
  }
}